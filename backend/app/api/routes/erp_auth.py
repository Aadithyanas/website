from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import RedirectResponse
from app.core.database import users_collection, invite_tokens_collection
from app.core.security import (
    hash_password, verify_password, create_access_token, 
    create_invite_jwt, decode_invite_jwt, SECRET_KEY, ALGORITHM
)
from app.core.dependencies import get_current_user
from app.schemas.erp_schemas import LoginRequest, RegisterRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_reset_password_email
from datetime import datetime, timedelta
import os
import httpx
from jose import jwt
from dotenv import load_dotenv

# Initialize Router
router = APIRouter(prefix="/api/erp/auth", tags=["ERP Auth"])

# Load Environment Variables
load_dotenv()

ADMIN_EMAIL = "adithyanas2694@gmail.com"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_CALLBACK_URL = os.getenv("GOOGLE_CALLBACK_URL", "http://localhost:8000/api/erp/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Startup check to see if .env loaded
print("\n" + "="*40)
print("--- [INIT] OAUTH CONFIGURATION ---")
print(f"Client ID: {'SET' if GOOGLE_CLIENT_ID else 'MISSING'}")
print(f"Client Secret: {'SET' if GOOGLE_CLIENT_SECRET else 'MISSING'}")
print(f"Callback URL: {GOOGLE_CALLBACK_URL}")
print("="*40 + "\n")

def user_to_dict(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "member"),
        "phone": user.get("phone"),
        "position": user.get("position"),
        "avatar": user.get("avatar"),
    }

# --- GOOGLE OAUTH ROUTES ---

@router.get("/google")
async def google_login():
    print("--- [STEP 1] REDIRECTING TO GOOGLE ---")
    if not GOOGLE_CLIENT_ID:
        print("CRITICAL ERROR: GOOGLE_CLIENT_ID missing in .env")
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    scope = "openid email profile"
    url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_CALLBACK_URL}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&access_type=offline"
    )
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str):
    print(f"--- [STEP 2] CALLBACK RECEIVED ---")
    print(f"Auth Code: {code[:10]}...")

    async with httpx.AsyncClient() as client:
        print("Exchanging code for tokens...")
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_CALLBACK_URL,
                "grant_type": "authorization_code",
            },
        )
    
    if token_resp.status_code != 200:
        print(f"TOKEN EXCHANGE FAILED: {token_resp.text}")
        raise HTTPException(status_code=400, detail="Failed to exchange Google token")
    
    token_data = token_resp.json()
    access_token_google = token_data.get("access_token")

    async with httpx.AsyncClient() as client:
        print("Fetching user info from Google...")
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token_google}"},
        )
    
    if userinfo_resp.status_code != 200:
        print(f"USER INFO FETCH FAILED: {userinfo_resp.text}")
        raise HTTPException(status_code=400, detail="Failed to fetch Google user info")
    
    google_user = userinfo_resp.json()
    email = google_user.get("email")
    print(f"User identified as: {email}")

    existing_user = await users_collection.find_one({"email": email})

    if not existing_user or not existing_user.get("registered"):
        print(f"ALERT: {email} is not registered in the DB yet.")
        return RedirectResponse(f"{FRONTEND_URL}/erp/login?error=not_registered")

    await users_collection.update_one(
        {"email": email},
        {"$set": {"avatar": google_user.get("picture", ""), "google_id": google_user.get("sub")}},
    )

    jwt_token = create_access_token({"sub": email})
    print("--- [SUCCESS] LOGIN COMPLETE ---")
    return RedirectResponse(f"{FRONTEND_URL}/erp/auth/callback?token={jwt_token}")

# --- STANDARD AUTH ROUTES ---

@router.post("/login")
async def login(body: LoginRequest):
    user = await users_collection.find_one({"email": body.email})
    
    if body.email == ADMIN_EMAIL:
        if not user or not user.get("password_hash"):
            new_admin_data = {
                "name": "Admin",
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(body.password),
                "role": "admin",
                "registered": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            if not user:
                await users_collection.insert_one(new_admin_data)
            else:
                await users_collection.update_one({"email": ADMIN_EMAIL}, {"$set": new_admin_data})
            user = await users_collection.find_one({"email": ADMIN_EMAIL})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if body.email != ADMIN_EMAIL and not user.get("registered"):
        raise HTTPException(status_code=403, detail="Please register via your invite link first")

    if not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

@router.post("/register")
async def register(body: RegisterRequest):
    email = decode_invite_jwt(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    invite = await invite_tokens_collection.find_one({"email": email, "used": False})
    if not invite:
        raise HTTPException(status_code=400, detail="Invite token has already been used")

    updates = {
        "password_hash": hash_password(body.password),
        "registered": True,
        "updated_at": datetime.utcnow(),
    }
    if body.name: updates["name"] = body.name

    await users_collection.update_one({"email": email}, {"$set": updates})
    await invite_tokens_collection.update_one({"email": email}, {"$set": {"used": True}})

    token = create_access_token({"sub": email})
    updated_user = await users_collection.find_one({"email": email})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(updated_user)}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return user_to_dict(current_user)

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": body.email})
    if user and user.get("registered"):
        reset_token = create_access_token({"sub": user["email"], "type": "reset"}, expires_delta=timedelta(minutes=30))
        await send_reset_password_email(user["email"], reset_token)
    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    try:
        payload = jwt.decode(body.token, SECRET_KEY, algorithms=[ALGORITHM])
        email, t_type = payload.get("sub"), payload.get("type")
        if not email or t_type != "reset": raise Exception()
    except:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    await users_collection.update_one(
        {"email": email},
        {"$set": {"password_hash": hash_password(body.new_password), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password reset successfully"}