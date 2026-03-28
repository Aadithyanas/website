from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import FileResponse
from app.core.database import tasks_collection, users_collection, notifications_collection
from app.core.dependencies import get_current_user, require_admin
from app.core.ws_manager import manager
from app.schemas.erp_schemas import TaskCreate, TaskUpdate, CommentCreate
from app.services.email_service import send_comment_notification_email
from app.services.notification_service import create_and_send_notification, broadcast_task_update
from bson import ObjectId
from datetime import datetime
import uuid
import shutil
import os
import re

router = APIRouter(prefix="/api/erp/tasks", tags=["ERP Tasks"])

ADMIN_EMAIL = "adithyanas2694@gmail.com"

def serialize_comment(c: dict) -> dict:
    created_at = c.get("created_at")
    return {
        "id": c.get("id", str(uuid.uuid4())),
        "author_id": c.get("author_id", ""),
        "author_name": c.get("author_name", ""),
        "author_avatar": c.get("author_avatar"),
        "content": c.get("content", ""),
        "image": c.get("image"),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at or ""),
    }


def serialize_task(task: dict) -> dict:
    created_at = task.get("created_at")
    updated_at = task.get("updated_at")
    
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description", ""),
        "status": task.get("status", "pending"),
        "sprint": task.get("sprint", "Backlog"),
        "team": task.get("team"),
        "estimated_time": task.get("estimated_time"),
        "assigned_to": task.get("assigned_to"),
        "assigned_to_name": task.get("assigned_to_name", "Unassigned"),
        "assigned_to_avatar": task.get("assigned_to_avatar"),
        "priority": task.get("priority", "medium"),
        "due_date": task.get("due_date"),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at or ""),
        "updated_at": updated_at.isoformat() if isinstance(updated_at, datetime) else str(updated_at or ""),
        "comments": [serialize_comment(c) for c in task.get("comments", [])],
        "org_id": str(task.get("org_id")),
        "images": task.get("images", []),
    }


@router.get("/")
async def list_tasks(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    team_role = current_user.get("team_role")
    team = current_user.get("team")
    org_id = current_user.get("org_id")

    query = {"org_id": org_id}

    # Requirement: Universal visibility (Anyone in the organization can see all tasks)
    # This prevents tasks "disappearing" from the list when reassigned.
    
    tasks = []
    cursor = tasks_collection.find(query)
    async for task in cursor:
        tasks.append(serialize_task(task))
    return tasks


@router.post("/")
async def create_task(body: TaskCreate, current_user: dict = Depends(get_current_user)):
    # Auth: Only admin or Team Leader can create tasks
    # The role check was removed as per instruction.
    
    if body.status not in ["todo", "inprogress", "qc", "reviewing", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    now = datetime.utcnow()
    
    # If admin/leader provides assigned_to, use it; else self
    assigned_to_id = body.assigned_to or str(current_user["_id"])
    target_user = current_user
    if body.assigned_to and body.assigned_to != str(current_user["_id"]):
        oid = ObjectId(body.assigned_to)
        target_user = await users_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
        if not target_user:
            raise HTTPException(status_code=404, detail="Assignee not found or not in your organization")

    task_doc = {
        "title": body.title,
        "description": body.description,
        "status": body.status,
        "sprint": body.sprint,
        "team": body.team or target_user.get("team"),
        "estimated_time": body.estimated_time,
        "assigned_to": assigned_to_id,
        "assigned_to_name": target_user.get("name", ""),
        "assigned_to_avatar": target_user.get("avatar"),
        "comments": [],
        "created_at": now,
        "updated_at": now,
        "org_id": current_user.get("org_id"),
        "images": body.images or [],
    }
    result = await tasks_collection.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id
    
    # WebSocket Broadcast to Org
    await broadcast_task_update(current_user.get("org_id"), serialize_task(task_doc), action="created")
    
    # Notify Assignee
    if assigned_to_id != str(current_user["_id"]):
        await create_and_send_notification(
            assigned_to_id, 
            f"You have been assigned a new task: {body.title}",
            str(task_doc["_id"])
        )
        
    return serialize_task(task_doc)

UPLOAD_DIR = "uploads"

@router.post("/{task_id}/upload")
async def upload_task_image(task_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Ensure the upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{task_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/api/erp/tasks/attachments/{file_name}"
    await tasks_collection.update_one({"_id": oid}, {"$push": {"images": image_url}})
    updated = await tasks_collection.find_one({"_id": oid})
    await broadcast_task_update(current_user.get("org_id"), serialize_task(updated), action="file_uploaded")
    
    return {"message": "File uploaded", "url": image_url}

@router.get("/attachments/{filename}")
async def get_attachment(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@router.put("/{task_id}")
async def update_task(task_id: str, body: TaskUpdate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not in your organization")
    
    # Auth: Admin can do anything. Team Leader can update tasks in their team. 
    # Regular members CANNOT update task fields directly via PUT (they should use status or reassign endpoints if needed, but for now we follow requirement: curd only for leaders)
    is_admin = current_user.get("role") == "admin"
    is_leader = current_user.get("team_role") == "Team Leader" and current_user.get("team") == task.get("team")

    if not (is_admin or is_leader):
        # Exception: Allow members to update ONLY their own task's status
        is_owner = task.get("assigned_to") == str(current_user["_id"])
        if is_owner and body.dict(exclude_unset=True).keys() == {"status"}:
            pass # Allow status update
        else:
            raise HTTPException(status_code=403, detail="Not authorized. Only leaders can edit tasks.")
    
    if body.status and body.status not in ["todo", "inprogress", "qc", "reviewing", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    updates = {k: v for k, v in body.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow()
    
    await tasks_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    
    # WebSocket Broadcast to Org
    await broadcast_task_update(current_user.get("org_id"), serialize_task(updated), action="updated")
    
    return serialize_task(updated)


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not in your organization")
    
    # Auth: Admin, HR, Manager OR the Team Leader of the same team.
    is_privileged = (current_user.get("role") in ["admin", "hr", "manager"])
    is_leader = current_user.get("team_role") == "Team Leader" and current_user.get("team") == task.get("team")

    if not (is_privileged or is_leader):
        # Additional check: If user is the task owner, we might allow it? No, requirement says only leaders.
        raise HTTPException(status_code=403, detail="Not authorized. Only leaders/admins can delete tasks.")
    
    await tasks_collection.delete_one({"_id": oid})
    
    # WebSocket Broadcast to Org
    await manager.broadcast_to_org({
        "type": "task_event",
        "action": "deleted",
        "task_id": task_id
    }, current_user.get("org_id"))
    
    return {"message": "Task deleted"}


@router.post("/{task_id}/comments")
async def add_comment(task_id: str, body: CommentCreate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not in your organization")

    comment = {
        "id": str(uuid.uuid4()),
        "author_id": str(current_user["_id"]),
        "author_name": current_user.get("name", ""),
        "author_avatar": current_user.get("avatar"),
        "content": body.content,
        "image": body.image,
        "created_at": datetime.utcnow(),
    }

    await tasks_collection.update_one(
        {"_id": oid},
        {"$push": {"comments": comment}, "$set": {"updated_at": datetime.utcnow()}},
    )

    # 1. Parse Mentions and Send Emails
    # Find all @Name in content
    mentions = re.findall(r"@([a-zA-Z0-9\s]+?)(?=\s|$|@)", body.content)
    sent_emails = set()
    
    for name_part in mentions:
        # Search for user in the same org with this name
        mentioned_user = await users_collection.find_one({
            "org_id": current_user.get("org_id"),
            "name": {"$regex": f"^{name_part.strip()}$", "$options": "i"}
        })
        if mentioned_user and mentioned_user.get("email"):
            email = mentioned_user["email"]
            if email != current_user.get("email") and email not in sent_emails:
                await send_comment_notification_email(
                    to_email=email,
                    sender_name=current_user.get("name", "Someone"),
                    task_title=task.get("title", "Task"),
                    content=body.content,
                    is_mention=True
                )
                sent_emails.add(email)

    # 2. Notify Assignee if not already notified and not the sender
    assignee_id = task.get("assigned_to")
    if assignee_id and assignee_id != str(current_user["_id"]):
        # Assignee ID might be str or ObjectId
        try:
            a_oid = ObjectId(assignee_id)
        except:
            a_oid = None
        assignee = await users_collection.find_one({"_id": a_oid or assignee_id})
        if assignee and assignee.get("email"):
            email = assignee["email"]
            if email not in sent_emails:
                await send_comment_notification_email(
                    to_email=email,
                    sender_name=current_user.get("name", "Someone"),
                    task_title=task.get("title", "Task"),
                    content=body.content,
                    is_mention=False
                )
                sent_emails.add(email)

    # 3. Legacy Notification (Internal)
    is_admin = current_user.get("role") == "admin"
    is_leader = current_user.get("team_role") == "Team Leader" and current_user.get("team") == task.get("team")
    
    if is_admin or is_leader:
        task_owner_id = task.get("assigned_to")
        if task_owner_id and task_owner_id != str(current_user["_id"]):
            sender_title = "Admin" if is_admin else "Team Leader"
            await create_and_send_notification(
                task_owner_id,
                f"{sender_title} commented on your task: \"{task.get('title', '')}\"",
                task_id
            )

    updated_task = await tasks_collection.find_one({"_id": oid})
    await broadcast_task_update(current_user.get("org_id"), serialize_task(updated_task), action="comment_added")

    return {"message": "Comment added", "comment": serialize_comment(comment)}


@router.get("/{task_id}/comments")
async def get_comments(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not in your organization")
    
    return [serialize_comment(c) for c in task.get("comments", [])]


@router.post("/{task_id}/reassign")
async def reassign_task(task_id: str, payload: dict, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")
    
    task = await tasks_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or not in your organization")
    
    new_assignee_id = payload.get("assigned_to")
    if not new_assignee_id:
        raise HTTPException(status_code=400, detail="assigned_to is required")

    # Auth: Universal Assignment (Anyone in the organization can reassign)
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    target_user = await users_collection.find_one({"_id": ObjectId(new_assignee_id), "org_id": current_user.get("org_id")})
    if not target_user:
        raise HTTPException(status_code=404, detail="Target member not found in your organization")

    updates = {
        "assigned_to": str(target_user["_id"]),
        "assigned_to_name": target_user.get("name", ""),
        "assigned_to_avatar": target_user.get("avatar"),
        "updated_at": datetime.utcnow()
    }

    await tasks_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await tasks_collection.find_one({"_id": oid})
    await broadcast_task_update(current_user.get("org_id"), serialize_task(updated), action="reassigned")
    
    # Notify new assignee
    if str(target_user["_id"]) != str(current_user["_id"]):
        await create_and_send_notification(
            str(target_user["_id"]),
            f"Task \"{updated.get('title')}\" has been reassigned to you by {current_user.get('name') or 'Admin'}",
            task_id
        )

    return {"message": "Task reassigned successfully", "assigned_to_name": target_user.get("name")}
