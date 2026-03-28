from app.core.database import notifications_collection
from app.core.ws_manager import manager
from datetime import datetime
from bson import ObjectId

async def create_and_send_notification(user_id: str, message: str, task_id: str = None):
    notif = {
        "user_id": user_id,
        "message": message,
        "task_id": task_id,
        "read": False,
        "created_at": datetime.utcnow()
    }
    result = await notifications_collection.insert_one(notif)
    notif["_id"] = result.inserted_id
    
    # Broadcast via WebSocket
    await manager.send_personal_message({
        "type": "notification_new",
        "data": {
            "id": str(notif["_id"]),
            "message": message,
            "task_id": task_id,
            "created_at": notif["created_at"].isoformat()
        }
    }, user_id)
    
    return notif

async def broadcast_task_update(org_id: str, task_data: dict, action: str = "updated"):
    await manager.broadcast_to_org({
        "type": "task_event",
        "action": action,
        "data": task_data
    }, org_id)
