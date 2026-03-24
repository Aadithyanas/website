from fastapi import APIRouter, HTTPException, Depends
from app.core.database import attendance_collection, users_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import LeaveRequestCreate, LeaveRequestUpdate
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/attendance", tags=["ERP Attendance"])


def serialize_leave(leave: dict) -> dict:
    return {
        "id": str(leave["_id"]),
        "member_id": leave.get("member_id", ""),
        "member_name": leave.get("member_name", ""),
        "member_avatar": leave.get("member_avatar"),
        "date": leave.get("date", ""),
        "description": leave.get("description", ""),
        "status": leave.get("status", "pending"),
        "created_at": leave.get("created_at", datetime.utcnow()).isoformat(),
    }


@router.get("/")
async def get_my_attendance(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        cursor = attendance_collection.find({})
    else:
        cursor = attendance_collection.find({"member_id": str(current_user["_id"])})
    
    records = []
    async for r in cursor:
        records.append(serialize_leave(r))
    return records


@router.get("/pending")
async def get_pending_leaves(admin: dict = Depends(require_admin)):
    cursor = attendance_collection.find({"status": "pending"}).sort("created_at", -1)
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
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    result = await attendance_collection.insert_one(record)
    record["_id"] = result.inserted_id
    return serialize_leave(record)


@router.put("/{leave_id}/respond")
async def respond_to_leave(leave_id: str, body: LeaveRequestUpdate, admin: dict = Depends(require_admin)):
    if body.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    try:
        oid = ObjectId(leave_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid leave ID")
    
    leave = await attendance_collection.find_one({"_id": oid})
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    await attendance_collection.update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "updated_at": datetime.utcnow()}},
    )
    updated = await attendance_collection.find_one({"_id": oid})
    return serialize_leave(updated)


@router.get("/calendar/{member_id}")
async def get_calendar_data(member_id: str, current_user: dict = Depends(get_current_user)):
    # Members can only see their own; admin can see anyone
    if current_user.get("role") != "admin" and str(current_user["_id"]) != member_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor = attendance_collection.find({"member_id": member_id})
    records = []
    async for r in cursor:
        records.append(serialize_leave(r))
    return records
