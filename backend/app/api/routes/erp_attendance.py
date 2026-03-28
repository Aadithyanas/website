from fastapi import APIRouter, HTTPException, Depends
from app.core.database import attendance_collection, users_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import LeaveRequestCreate, LeaveRequestUpdate
from app.services.email_service import send_leave_notification_email
from app.services.notification_service import create_and_send_notification, manager
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/attendance", tags=["ERP Attendance"])

ADMIN_EMAIL = "adithyanas2694@gmail.com"


def serialize_leave(leave: dict) -> dict:
    return {
        "id": str(leave["_id"]),
        "member_id": leave.get("member_id", ""),
        "member_name": leave.get("member_name", ""),
        "member_avatar": leave.get("member_avatar"),
        "date": leave.get("date", ""),
        "description": leave.get("description", ""),
        "leave_type": leave.get("leave_type", "casual"),
        "status": leave.get("status", "pending"),
        "created_at": leave.get("created_at", datetime.utcnow()).isoformat(),
    }


@router.get("/")
async def get_my_attendance(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    role = current_user.get("role")
    
    if role in ["admin", "hr", "manager"]:
        cursor = attendance_collection.find({"org_id": org_id})
    else:
        cursor = attendance_collection.find({"member_id": str(current_user["_id"]), "org_id": org_id})
    
    records = []
    async for r in cursor:
        records.append(serialize_leave(r))
    return records


@router.get("/pending")
async def get_pending_leaves(admin: dict = Depends(require_admin)):
    cursor = attendance_collection.find({"status": "pending", "org_id": admin.get("org_id")}).sort("created_at", -1)
    records = []
    async for r in cursor:
        records.append(serialize_leave(r))
    return records


@router.post("/request")
async def submit_leave_request(body: LeaveRequestCreate, current_user: dict = Depends(get_current_user)):
    # Check for duplicate date
    existing = await attendance_collection.find_one({
        "member_id": str(current_user["_id"]),
        "date": body.date,
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already have a leave request for this date")

    record = {
        "member_id": str(current_user["_id"]),
        "member_name": current_user.get("name", ""),
        "member_avatar": current_user.get("avatar"),
        "date": body.date,
        "description": body.description,
        "leave_type": body.leave_type,
        "status": "pending",
        "org_id": current_user.get("org_id"),
        "created_at": datetime.utcnow(),
    }
    result = await attendance_collection.insert_one(record)
    record["_id"] = result.inserted_id

    # Send email notification to admin
    try:
        await send_leave_notification_email(
            ADMIN_EMAIL,
            current_user.get("name", "A member"),
            body.date,
            body.description
        )
    except Exception as e:
        print(f"Failed to send leave notification email: {str(e)}")

    # WebSocket Broadcast to Org (Admins)
    await manager.broadcast_to_org({
        "type": "leave_event",
        "action": "created",
        "data": serialize_leave(record)
    }, current_user.get("org_id"))

    return serialize_leave(record)


@router.put("/{leave_id}/respond")
async def respond_to_leave(leave_id: str, body: LeaveRequestUpdate, admin: dict = Depends(require_admin)):
    if body.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    try:
        oid = ObjectId(leave_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid leave ID")
    
    leave = await attendance_collection.find_one({"_id": oid, "org_id": admin.get("org_id")})
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found in your organization")
    
    await attendance_collection.update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "updated_at": datetime.utcnow()}},
    )
    updated = await attendance_collection.find_one({"_id": oid})
    
    # Notify member
    await create_and_send_notification(
        updated.get("member_id"),
        f"Your leave request for {updated.get('date')} has been {body.status}.",
    )
    
    # Broadcast to Org (for Admin list update)
    await manager.broadcast_to_org({
        "type": "leave_event",
        "action": "updated",
        "data": serialize_leave(updated)
    }, admin.get("org_id"))
    
    return serialize_leave(updated)

@router.get("/calendar/{member_id}")
async def get_calendar_data(member_id: str, current_user: dict = Depends(get_current_user)):
    # Members can only see their own; admin can see anyone in THEIR org
    org_id = current_user.get("org_id")
    if current_user.get("role") not in ["admin", "hr", "manager"] and str(current_user["_id"]) != member_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor = attendance_collection.find({"member_id": member_id, "org_id": org_id})
    records = []
    async for r in cursor:
        records.append(serialize_leave(r))
    return records
