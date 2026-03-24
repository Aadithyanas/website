from fastapi import APIRouter, HTTPException, Depends
from app.core.database import notifications_collection
from app.core.dependencies import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/notifications", tags=["ERP Notifications"])


def serialize_notif(n: dict) -> dict:
    return {
        "id": str(n["_id"]),
        "user_id": n.get("user_id", ""),
        "message": n.get("message", ""),
        "task_id": n.get("task_id"),
        "read": n.get("read", False),
        "created_at": n.get("created_at", datetime.utcnow()).isoformat(),
    }


@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    cursor = notifications_collection.find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1)
    notifs = []
    async for n in cursor:
        notifs.append(serialize_notif(n))
    return notifs


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await notifications_collection.count_documents(
        {"user_id": str(current_user["_id"]), "read": False}
    )
    return {"count": count}


@router.put("/{notif_id}/read")
async def mark_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    await notifications_collection.update_one(
        {"_id": oid, "user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
    )
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    await notifications_collection.update_many(
        {"user_id": str(current_user["_id"]), "read": False},
        {"$set": {"read": True}},
    )
    return {"message": "All notifications marked as read"}
