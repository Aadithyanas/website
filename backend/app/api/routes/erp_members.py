from fastapi import APIRouter, HTTPException, Depends, status
from app.core.database import users_collection, invite_tokens_collection
from app.core.security import create_invite_jwt
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import InviteMemberRequest, MemberUpdate
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
        "team": user.get("team"), # Deprecated
        "teams": user.get("teams") or ([user.get("team")] if user.get("team") else []),
        "team_role": user.get("team_role"),
        "sprint": user.get("sprint"),
        "avatar": user.get("avatar"),
        "org_id": str(user.get("org_id", "")),
        "org_name": user.get("org_name", ""),
        "base_salary": user.get("base_salary", 0),
        "bank_name": user.get("bank_name"),
        "account_number": user.get("account_number"),
        "ifsc_code": user.get("ifsc_code"),
        "permissions": user.get("permissions") or [],
        "registered": user.get("registered", False),
        "created_at": (user.get("created_at") or datetime.utcnow()).isoformat(),
    }


@router.get("/")
async def list_members(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    cursor = users_collection.find({"org_id": org_id})
    members = []
    async for user in cursor:
        members.append(serialize_user(user))
    return members


@router.post("/invite")
async def invite_member(body: InviteMemberRequest, admin: dict = Depends(require_admin)):
    # Check if already in THIS organization
    org_id = admin.get("org_id")
    existing_in_org = await users_collection.find_one({"email": body.email, "org_id": org_id})
    if existing_in_org and existing_in_org.get("registered"):
        raise HTTPException(status_code=400, detail="User with this email is already registered in your organization")

    token = create_invite_jwt(body.email, str(org_id))

    if not existing_in_org:
        # Create pending user record
        await users_collection.insert_one({
            "email": body.email,
            "name": body.name,
            "phone": body.phone,
            "position": body.position,
            "team": body.teams[0] if body.teams else body.team,
            "teams": body.teams or ([body.team] if body.team else []),
            "team_role": body.team_role,
            "sprint": body.sprint,
            "base_salary": body.base_salary,
            "bank_name": body.bank_name,
            "account_number": body.account_number,
            "ifsc_code": body.ifsc_code,
            "permissions": body.permissions or [],
            "role": "member",
            "org_id": admin.get("org_id"),
            "org_name": admin.get("org_name"),
            "registered": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        })

    # Store/update invite token record (scoped by org_id)
    await invite_tokens_collection.update_one(
        {"email": body.email, "org_id": org_id},
        {"$set": {"token": token, "used": False, "created_at": datetime.utcnow()}},
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
    user = await users_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not user:
        raise HTTPException(status_code=404, detail="Member not found or not in your organization")
    return serialize_user(user)


@router.put("/{member_id}")
async def update_member(member_id: str, body: MemberUpdate, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid member ID")
    
    updates = body.dict(exclude_unset=True)
    
    # If teams is provided, sync team (singular) for backward compatibility
    if "teams" in updates and updates["teams"]:
        updates["team"] = updates["teams"][0]
    elif "team" in updates:
        updates["teams"] = [updates["team"]]
        
    updates["updated_at"] = datetime.utcnow()
    
    result = await users_collection.update_one({"_id": oid, "org_id": admin.get("org_id")}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found or not in your organization")
    
    # Return updated user for context sync
    updated = await users_collection.find_one({"_id": oid})
    return serialize_user(updated)


@router.delete("/{member_id}")
async def delete_member(member_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(member_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid member ID")
    
    target = await users_collection.find_one({"_id": oid})
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Org Isolation
    if target.get("org_id") != admin.get("org_id"):
        raise HTTPException(status_code=403, detail="Not authorized to delete member from another organization")

    # Permissions Logic:
    # 1. Admin can remove anyone.
    # 2. HR/Manager can remove Admin.
    # (Requirement: "hr and manger can remoev admin... but admin can remoev the hr and manager and member")
    
    remover_role = admin.get("role")
    target_role = target.get("role")
    
    can_delete = False
    if remover_role == "admin":
        can_delete = True # Admin can remove everyone
    elif remover_role in ["hr", "manager"]:
        if target_role == "admin":
            can_delete = True # HR/Manager can remove Admin
        elif target_role in ["hr", "manager", "member"]:
            can_delete = True # HR/Manager can remove colleagues/members too? Usually yes if they have admin access
    
    if not can_delete:
        raise HTTPException(status_code=403, detail="Insufficient permissions to delete this member")

    result = await users_collection.delete_one({"_id": oid})
    
    # Requirement: "if admin remove any of one that ivite link not work next time"
    await invite_tokens_collection.delete_many({"email": target.get("email")})
    
    return {"message": "Member removed from organization"}
