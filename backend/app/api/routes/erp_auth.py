from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import RedirectResponse
from app.core.database import users_collection, invite_tokens_collection, orgs_collection
from app.core.security import (
    hash_password, verify_password, create_access_token, 
    create_invite_jwt, decode_invite_jwt, SECRET_KEY, ALGORITHM
)
from app.core.dependencies import get_current_user
from app.schemas.erp_schemas import OrganizationSignupRequest, LoginRequest, RegisterRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.services.email_service import send_reset_password_email
from datetime import datetime, timedelta
import os
import httpx
from jose import jwt
from dotenv import load_dotenv
from bson import ObjectId
from urllib.parse import urlencode

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
        "team": user.get("team"),
        "teams": user.get("teams") or ([user.get("team")] if user.get("team") else []),
        "team_role": user.get("team_role"),
        "sprint": user.get("sprint"),
        "phone": user.get("phone"),
        "position": user.get("position"),
        "team_role": user.get("team_role"),
        "sprint": user.get("sprint"),
        "phone": user.get("phone"),
        "position": user.get("position"),
        "avatar": user.get("avatar"),
        "org_id": str(user.get("org_id", "")),
        "org_name": user.get("org_name", ""),
        "base_salary": user.get("base_salary", 0),
    }

# --- GOOGLE OAUTH ROUTES ---

@router.get("/google")
async def google_login(invite_token: str = None):
    print("--- [STEP 1] REDIRECTING TO GOOGLE ---")
    state = invite_token if invite_token else "none"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "select_account"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, state: str = "none"):
    # Token exchange
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post("https://oauth2.googleapis.com/token", data=token_data)
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google tokens")
        
        tokens = token_resp.json()
        access_token = tokens.get("access_token")
        
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if userinfo_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch Google user info")
    
    google_user = userinfo_resp.json()
    email = google_user.get("email")
    print(f"User identified as: {email}")

    # Process Invitation if present in state
    if state and state != "none":
        try:
            invite_payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])
            invite_email = invite_payload.get("sub")
            invite_org_id = invite_payload.get("org_id")
            
            if invite_email == email:
                target_org_id = invite_org_id
                print(f"--- [INVITE DETECTED] Org: {target_org_id} ---")
                
                if not target_org_id or target_org_id == "none":
                    print(f"Invite processing failed: No target org_id found for {email}")
                    return RedirectResponse(f"{FRONTEND_URL}/erp/login?error=auth_failed")

                # MARK USER AS REGISTERED AND LINK GOOGLE ID
                update_data = {
                    "registered": True, 
                    "avatar": google_user.get("picture", ""),
                    "google_id": google_user.get("sub")
                }
                # Also sync name if not set or generic
                current_user = await users_collection.find_one({"email": email, "org_id": target_org_id})
                if current_user:
                    if not current_user.get("name") or current_user.get("name") == email:
                        update_data["name"] = google_user.get("name", "")

                    await users_collection.update_one(
                        {"email": email, "org_id": target_org_id},
                        {"$set": update_data}
                    )
                    print(f"--- [AUTO-REGISTERED] {email} via Invite ---")
                    
                    # Log in DIRECTLY to the invited organization
                    updated_user = await users_collection.find_one({"email": email, "org_id": target_org_id, "registered": True})
                    if updated_user:
                        jwt_token = create_access_token({"sub": updated_user["email"], "org_id": str(updated_user["org_id"])})
                        return RedirectResponse(f"{FRONTEND_URL}/erp/dashboard?token={jwt_token}")
        except Exception as e:
            print(f"Invite state processing failed: {e}")

    users_cursor = users_collection.find({"email": email, "registered": True})
    users = await users_cursor.to_list(length=10)

    if not users:
        print(f"ALERT: {email} is not registered in the DB yet.")
        return RedirectResponse(f"{FRONTEND_URL}/erp/login?error=not_registered")

    await users_collection.update_many(
        {"email": email},
        {"$set": {"avatar": google_user.get("picture", ""), "google_id": google_user.get("sub")}},
    )

    if len(users) > 1:
        # Generate a temporary token that expires in 5 minutes for selection
        selection_token = create_access_token({"sub": email, "type": "multi_org_selection"}, expires_delta=timedelta(minutes=5))
        return RedirectResponse(f"{FRONTEND_URL}/erp/select-org?selection_token={selection_token}")

    user = users[0]
    jwt_token = create_access_token({"sub": email, "org_id": str(user["org_id"])})
    print("--- [SUCCESS] LOGIN COMPLETE ---")
    return RedirectResponse(f"{FRONTEND_URL}/erp/auth/callback?token={jwt_token}")

# --- NEW ORGANIZATION SIGNUP ---

@router.post("/signup")
async def signup_organization(body: OrganizationSignupRequest):
    # In multi-tenant, we allow the same email to create multiple organizations. 
    # The login flow handles selecting the correct one.

    org_id = str(ObjectId()) # Unique Org ID
    
    new_user = {
        "name": body.admin_name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "phone": body.phone,
        "org_id": org_id,
        "org_name": body.org_name,
        "role": "admin",
        "registered": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    await users_collection.insert_one(new_user)
    
    # Initialize organization settings
    await orgs_collection.insert_one({
        "org_id": org_id,
        "org_name": body.org_name,
        "positions": ["Developer", "Designer", "Manager", "HR", "Tester"],
        "teams": ["IT", "Robotics", "Social Media", "Marketing"],
        "sprints": ["Backlog", "Q1-Sprint-1", "Q1-Sprint-2"],
        "created_at": datetime.utcnow()
    })
    
    token = create_access_token({"sub": body.email, "org_id": org_id})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(new_user)}

# --- STANDARD AUTH ROUTES ---

@router.post("/login")
async def login(body: LoginRequest):
    users_cursor = users_collection.find({"email": body.email})
    users = await users_cursor.to_list(length=10)
    
    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Filter registered users
    registered_users = [u for u in users if u.get("registered")]
    if not registered_users:
        raise HTTPException(status_code=403, detail="Please register via your invite link first")

    # If org_id is provided, log in to that specific one
    if body.org_id:
        user = next((u for u in registered_users if str(u["org_id"]) == body.org_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="Organization account not found")
        
        pwd_hash = user.get("password_hash")
        if not pwd_hash:
            raise HTTPException(status_code=400, detail="This account uses Google Login. Please use 'Continue with Google'.")

        if not verify_password(body.password, pwd_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_access_token({"sub": user["email"], "org_id": str(user["org_id"])})
        return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

    # If multiple accounts and no org_id, return the list for selection
    if len(registered_users) > 1:
        # We still verify password for at least one to ensure they are the owner
        # Or better: check if password matches ANY of them
        valid_users = [u for u in registered_users if u.get("password_hash") and verify_password(body.password, u["password_hash"])]
        if not valid_users:
            # Check if all registered users are social-only
            if all(not u.get("password_hash") for u in registered_users):
                raise HTTPException(status_code=400, detail="Your accounts use Google Login. Please use 'Continue with Google'.")
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        if len(valid_users) > 1:
            return {
                "multi_org": True,
                "accounts": [
                    {"org_id": str(u["org_id"]), "org_name": u.get("org_name", "Unknown")} 
                    for u in valid_users
                ]
            }
        user = valid_users[0]
    else:
        user = registered_users[0]
        if not verify_password(body.password, user.get("password_hash", "")):
            raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["email"], "org_id": str(user["org_id"])})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

@router.post("/register")
async def register(body: RegisterRequest):
    # Find the specific invite by token
    invite = await invite_tokens_collection.find_one({"token": body.token, "used": False})
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid or already used invite token")

    email = invite["email"]
    org_id = invite["org_id"]

    updates = {
        "password_hash": hash_password(body.password),
        "registered": True,
        "updated_at": datetime.utcnow(),
    }
    if body.name: updates["name"] = body.name

    await users_collection.update_one({"email": email, "org_id": org_id}, {"$set": updates})
    await invite_tokens_collection.update_one({"token": body.token}, {"$set": {"used": True}})

    token = create_access_token({"sub": email, "org_id": str(org_id)})
    updated_user = await users_collection.find_one({"email": email, "org_id": org_id})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(updated_user)}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return user_to_dict(current_user)

@router.get("/accounts")
async def get_user_accounts(current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="User email not found")
    
    cursor = users_collection.find({"email": email, "registered": True})
    accounts = await cursor.to_list(length=20)
    
    return [user_to_dict(acc) for acc in accounts]

@router.post("/switch/{org_id}")
async def switch_organization(org_id: str, current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    
    # Verify access
    user = await users_collection.find_one({"email": email, "org_id": org_id, "registered": True})
    if not user:
        raise HTTPException(status_code=403, detail="Access denied to this organization")
    
    token = create_access_token({"sub": email, "org_id": org_id})
    return {"access_token": token, "token_type": "bearer", "user": user_to_dict(user)}

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