from fastapi import APIRouter, HTTPException, Depends, status
from app.core.database import users_collection, invite_tokens_collection
from app.core.security import create_invite_jwt
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import InviteMemberRequest
from app.services.email_service import send_invite_email
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/members", tags=["ERP Members"])

ADMIN_EMAIL = "adithyanas2694@gmail.com"


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone"),
        "position": user.get("position"),
        "role": user.get("role", "member"),
        "avatar": user.get("avatar"),
        "registered": user.get("registered", False),
        "created_at": user.get("created_at", datetime.utcnow()).isoformat(),
    }


@router.get("/")
async def list_members(admin: dict = Depends(require_admin)):
    cursor = users_collection.find({})
    members = []
    async for user in cursor:
        members.append(serialize_user(user))
    return members


@router.post("/invite")
async def invite_member(body: InviteMemberRequest, admin: dict = Depends(require_admin)):
    # Check if already invited or exists
    existing = await users_collection.find_one({"email": body.email})
    if existing and existing.get("registered"):
        raise HTTPException(status_code=400, detail="User with this email is already registered")

    token = create_invite_jwt(body.email)

    if not existing:
        # Create pending user record
        await users_collection.insert_one({
            "email": body.email,
            "name": body.name,
            "phone": body.phone,
            "position": body.position,
            "role": "member",
            "registered": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })

    # Store/update invite token record
    await invite_tokens_collection.update_one(
        {"email": body.email},
        {"$set": {"email": body.email, "token": token, "used": False, "created_at": datetime.utcnow()}},
        upsert=True,
    )

    # Send invite email
    try:
        await send_invite_email(body.email, body.name, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invite email: {str(e)}")

    return {"message": f"Invite sent to {body.email}", "email": body.email}


@router.get("/{member_id}")
async def get_member(member_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid member ID")
    user = await users_collection.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")
    return serialize_user(user)


@router.put("/{member_id}")
async def update_member(member_id: str, body: dict, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid member ID")
    
    allowed = ["name", "phone", "position", "avatar"]
    updates = {k: v for k, v in body.items() if k in allowed}
    updates["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member updated"}
