from fastapi import APIRouter, HTTPException, Depends
from app.core.database import tasks_collection, users_collection, notifications_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import TaskCreate, TaskUpdate, CommentCreate
from bson import ObjectId
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/erp/tasks", tags=["ERP Tasks"])

ADMIN_EMAIL = "adithyanas2694@gmail.com"


def serialize_comment(c: dict) -> dict:
    return {
        "id": c.get("id", str(uuid.uuid4())),
        "author_id": c.get("author_id", ""),
        "author_name": c.get("author_name", ""),
        "author_avatar": c.get("author_avatar"),
        "content": c.get("content", ""),
        "created_at": c.get("created_at", datetime.utcnow()).isoformat(),
    }


def serialize_task(task: dict) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task.get("title", ""),
        "description": task.get("description"),
        "status": task.get("status", "pending"),
        "assigned_to": task.get("assigned_to", ""),
        "assigned_to_name": task.get("assigned_to_name", ""),
        "assigned_to_avatar": task.get("assigned_to_avatar"),
        "created_at": task.get("created_at", datetime.utcnow()).isoformat(),
        "updated_at": task.get("updated_at", datetime.utcnow()).isoformat(),
        "comments": [serialize_comment(c) for c in task.get("comments", [])],
    }


@router.get("/")
async def get_tasks(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") == "admin":
        cursor = tasks_collection.find({})
    else:
        cursor = tasks_collection.find({"assigned_to": str(current_user["_id"])})
    
    tasks = []
    async for task in cursor:
        tasks.append(serialize_task(task))
    return tasks


@router.post("/")
async def create_task(body: TaskCreate, current_user: dict = Depends(get_current_user)):
    if body.status not in ["pending", "ongoing", "testing", "previewing", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    now = datetime.utcnow()
    task_doc = {
        "title": body.title,
        "description": body.description,
        "status": body.status,
        "assigned_to": str(current_user["_id"]),
        "assigned_to_name": current_user.get("name", ""),
        "assigned_to_avatar": current_user.get("avatar"),
        "comments": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await tasks_collection.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id
    return serialize_task(task_doc)


@router.put("/{task_id}")
async def update_task(task_id: str, body: TaskUpdate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Members can only update their own tasks; admin can update any
    if current_user.get("role") != "admin" and task.get("assigned_to") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if body.status and body.status not in ["pending", "ongoing", "testing", "previewing", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    updates = {k: v for k, v in body.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow()
    
    await tasks_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await tasks_collection.find_one({"_id": oid})
    return serialize_task(updated)


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.get("role") != "admin" and task.get("assigned_to") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await tasks_collection.delete_one({"_id": oid})
    return {"message": "Task deleted"}


@router.post("/{task_id}/comments")
async def add_comment(task_id: str, body: CommentCreate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = {
        "id": str(uuid.uuid4()),
        "author_id": str(current_user["_id"]),
        "author_name": current_user.get("name", ""),
        "author_avatar": current_user.get("avatar"),
        "content": body.content,
        "created_at": datetime.utcnow(),
    }

    await tasks_collection.update_one(
        {"_id": oid},
        {"$push": {"comments": comment}, "$set": {"updated_at": datetime.utcnow()}},
    )

    # If admin is commenting → create notification for the task owner
    if current_user.get("role") == "admin":
        task_owner_id = task.get("assigned_to")
        if task_owner_id and task_owner_id != str(current_user["_id"]):
            await notifications_collection.insert_one({
                "user_id": task_owner_id,
                "message": f"Admin commented on your task: \"{task.get('title', '')}\"",
                "task_id": task_id,
                "read": False,
                "created_at": datetime.utcnow(),
            })

    return {"message": "Comment added", "comment": {**comment, "created_at": comment["created_at"].isoformat()}}


@router.get("/{task_id}/comments")
async def get_comments(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return [serialize_comment(c) for c in task.get("comments", [])]
