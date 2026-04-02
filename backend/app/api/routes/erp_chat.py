from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from app.core.database import chat_messages_collection, chat_groups_collection, users_collection
from app.core.dependencies import get_current_user
from app.core.ws_manager import manager
from app.schemas.erp_schemas import ChatMessageCreate, ChatMessageOut, ChatGroupCreate, ChatGroupOut, ChatMessageStatusUpdate, ReplyInfo, GroupAdminTransfer, ChatGroupUpdate, GroupAddMembers
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import os
import uuid
import shutil

router = APIRouter(prefix="/api/erp/chat", tags=["ERP Chat"])

UPLOAD_DIR = "uploads/chat"

def serialize_message(msg: dict) -> dict:
    reply_to = None
    if msg.get("reply_to"):
        r = msg["reply_to"]
        reply_to = {"id": str(r.get("id", "")), "content": r.get("content", ""), "sender_name": r.get("sender_name", "Unknown")}
    return {
        "id": str(msg["_id"]),
        "sender_id": str(msg["sender_id"]),
        "sender_name": msg.get("sender_name", "Unknown"),
        "sender_avatar": msg.get("sender_avatar"),
        "recipient_id": str(msg["recipient_id"]),
        "content": msg["content"],
        "is_group": msg.get("is_group", False),
        "status": msg.get("status", "sent"),
        "attachments": msg.get("attachments", []),
        "created_at": msg["created_at"].isoformat() if isinstance(msg["created_at"], datetime) else msg["created_at"],
        "reply_to": reply_to,
        "is_forwarded": msg.get("is_forwarded", False)
    }

def serialize_group(group: dict) -> dict:
    return {
        "id": str(group["_id"]),
        "name": group["name"],
        "members": group["members"],
        "description": group.get("description"),
        "created_at": group["created_at"].isoformat() if isinstance(group["created_at"], datetime) else group["created_at"],
        "created_by": str(group["created_by"]),
        "admin_id": str(group.get("admin_id", group.get("created_by")))
    }

@router.get("/messages", response_model=List[ChatMessageOut])
async def get_chat_history(recipient_id: str, is_group: bool = False, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    user_id = str(current_user["_id"])
    
    if is_group:
        query = {"recipient_id": recipient_id, "org_id": org_id, "is_group": True}
    else:
        # Private message: either sender=me and recipient=them OR sender=them and recipient=me
        query = {
            "org_id": org_id,
            "is_group": False,
            "$or": [
                {"sender_id": user_id, "recipient_id": recipient_id},
                {"sender_id": recipient_id, "recipient_id": user_id}
            ]
        }
    
    cursor = chat_messages_collection.find(query).sort("created_at", 1).limit(100)
    messages = []
    async for msg in cursor:
        messages.append(serialize_message(msg))
    return messages

@router.post("/messages", response_model=ChatMessageOut)
async def send_message(body: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    user_id = str(current_user["_id"])
    now = datetime.utcnow()

    # Resolve reply_to if provided
    reply_to_embed = None
    if body.reply_to_id:
        try:
            orig = await chat_messages_collection.find_one({"_id": ObjectId(body.reply_to_id)})
            if orig:
                reply_to_embed = {
                    "id": str(orig["_id"]),
                    "content": orig.get("content", ""),
                    "sender_name": orig.get("sender_name", "Unknown")
                }
        except Exception:
            pass

    msg_doc = {
        "org_id": org_id,
        "sender_id": user_id,
        "sender_name": current_user.get("name"),
        "sender_avatar": current_user.get("avatar"),
        "recipient_id": body.recipient_id,
        "content": body.content,
        "is_group": body.is_group,
        "status": "sent",
        "attachments": body.attachments,
        "created_at": now,
        "reply_to": reply_to_embed,
        "is_forwarded": body.is_forwarded or False
    }

    result = await chat_messages_collection.insert_one(msg_doc)
    msg_doc["_id"] = result.inserted_id
    serialized = serialize_message(msg_doc)

    # Broadcast via WebSocket
    ws_payload = {
        "type": "chat_message",
        "data": serialized
    }

    if body.is_group:
        # Broadcast to all group members who are online
        group = await chat_groups_collection.find_one({"_id": ObjectId(body.recipient_id)})
        if group:
            for member_id in group["members"]:
                if member_id != user_id:
                    await manager.send_personal_message(ws_payload, member_id)
    else:
        # Broadcast to specific recipient
        await manager.send_personal_message(ws_payload, body.recipient_id)

    return serialized

@router.patch("/messages/status")
async def update_message_status(
    body: ChatMessageStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    org_id = current_user.get("org_id")
    status = body.status
    
    query = {"org_id": org_id}
    
    if body.conversation_id:
        # Seen update for all messages FROM conversation_id TO me
        query.update({
            "sender_id": body.conversation_id,
            "recipient_id": user_id,
            "status": {"$ne": "seen"},
            "is_group": False
        })
    elif body.message_ids:
        # Delivered update for specific messages sent from someone else to me
        query.update({
            "_id": {"$in": [ObjectId(mid) for mid in body.message_ids]},
            "recipient_id": user_id
        })
    else:
        return {"count": 0}

    # Find messages to be updated BEFORE updating them to know who the sender is
    cursor = chat_messages_collection.find(query)
    messages_to_notify = []
    async for m in cursor:
        messages_to_notify.append(serialize_message(m))

    # Update messages in DB
    await chat_messages_collection.update_many(query, {"$set": {"status": status}})
    
    for msg in messages_to_notify:
        # Notify the sender that their message was seen/delivered
        await manager.send_personal_message({
            "type": "chat_status_update",
            "data": {
                "message_id": msg["id"],
                "status": status,
                "recipient_id": user_id # Who saw it
            }
        }, msg["sender_id"])

    return {"count": len(messages_to_notify)}

@router.post("/groups", response_model=ChatGroupOut)
async def create_group(body: ChatGroupCreate, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    user_id = str(current_user["_id"])
    
    # Ensure creator is in members
    members = list(set(body.members + [user_id]))
    
    group_doc = {
        "org_id": org_id,
        "name": body.name,
        "members": members,
        "description": body.description,
        "created_by": user_id,
        "admin_id": user_id,
        "created_at": datetime.utcnow()
    }
    
    result = await chat_groups_collection.insert_one(group_doc)
    group_doc["_id"] = result.inserted_id

    # Notify members of new group
    for member_id in members:
        if member_id != user_id:
            await manager.send_personal_message({
                "type": "chat_group_created",
                "data": serialize_group(group_doc)
            }, member_id)

    return serialize_group(group_doc)

@router.get("/groups", response_model=List[ChatGroupOut])
async def list_groups(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    org_id = current_user.get("org_id")
    
    cursor = chat_groups_collection.find({"org_id": org_id, "members": user_id})
    groups = []
    async for g in cursor:
        groups.append(serialize_group(g))
    return groups

@router.post("/groups/{group_id}/transfer_admin")
async def transfer_admin(group_id: str, body: GroupAdminTransfer, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    group = await chat_groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    admin_id = str(group.get("admin_id", group.get("created_by")))
    if admin_id != user_id:
        raise HTTPException(status_code=403, detail="Only the admin can transfer admin rights")
        
    if body.new_admin_id not in group.get("members", []):
        raise HTTPException(status_code=400, detail="New admin must be a member of the group")
        
    await chat_groups_collection.update_one(
        {"_id": ObjectId(group_id)}, 
        {"$set": {"admin_id": body.new_admin_id}}
    )
    return {"status": "success", "new_admin_id": body.new_admin_id}

@router.post("/groups/{group_id}/leave")
async def leave_group(group_id: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    group = await chat_groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    members = group.get("members", [])
    if user_id not in members:
        raise HTTPException(status_code=400, detail="Not a member of this group")
        
    admin_id = str(group.get("admin_id", group.get("created_by")))
    
    if len(members) == 1:
        # Last member, delete group
        await chat_groups_collection.delete_one({"_id": ObjectId(group_id)})
        return {"status": "success", "action": "deleted"}
        
    if admin_id == user_id:
        raise HTTPException(status_code=400, detail="Admin cannot leave without transferring admin rights first")
        
    await chat_groups_collection.update_one(
        {"_id": ObjectId(group_id)},
        {"$pull": {"members": user_id}}
    )
    return {"status": "success", "action": "left"}

@router.patch("/groups/{group_id}", response_model=ChatGroupOut)
async def update_group(group_id: str, body: ChatGroupUpdate, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    group = await chat_groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    members = group.get("members", [])
    if user_id not in members:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    update_fields = {}
    if body.name is not None: update_fields["name"] = body.name
    if body.description is not None: update_fields["description"] = body.description
    
    if update_fields:
        await chat_groups_collection.update_one({"_id": ObjectId(group_id)}, {"$set": update_fields})
        group.update(update_fields)
        
    return serialize_group(group)

@router.post("/groups/{group_id}/add_members", response_model=ChatGroupOut)
async def add_group_members(group_id: str, body: GroupAddMembers, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    group = await chat_groups_collection.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    admin_id = str(group.get("admin_id", group.get("created_by")))
    if admin_id != user_id:
        raise HTTPException(status_code=403, detail="Only the admin can add members")
        
    current_members = set(group.get("members", []))
    new_members = [m for m in body.new_members if m not in current_members]
    
    if new_members:
        await chat_groups_collection.update_one(
            {"_id": ObjectId(group_id)},
            {"$push": {"members": {"$each": new_members}}}
        )
        group["members"].extend(new_members)
        
        notif_data = serialize_group(group)
        for mid in new_members:
            await manager.send_personal_message({
                "type": "chat_group_created",
                "data": notif_data
            }, mid)
            
    return serialize_group(group)

@router.post("/upload")
async def upload_chat_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"chat_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/api/erp/chat/attachments/{file_name}"}

@router.get("/attachments/{filename}")
async def get_chat_attachment(filename: str):
    from fastapi.responses import FileResponse
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
