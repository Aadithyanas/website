from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.ws_manager import manager
from app.core.security import decode_access_token
from app.core.database import users_collection
from bson import ObjectId
import json

router = APIRouter(prefix="/ws/erp", tags=["ERP WebSockets"])

@router.websocket("/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # For simplicity, we pass token in URL. In production, use headers or a separate auth step.
    try:
        payload = decode_access_token(token)
        if not payload:
            await websocket.close(code=1008)
            return
            
        email = payload.get("sub")
        org_id = str(payload.get("org_id")) if payload.get("org_id") else None
        
        if not email or not org_id:
            await websocket.close(code=1008)
            return

        user = await users_collection.find_one({"email": email, "org_id": org_id})
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = str(user["_id"])
        
        await manager.connect(user_id, org_id, websocket)
        
        # Broadcast online status
        await manager.broadcast_to_org({
            "type": "user_online",
            "data": {"user_id": user_id}
        }, org_id)

        try:
            while True:
                # Handle incoming messages
                data = await websocket.receive_text()
                try:
                    msg = json.loads(data)
                    action = msg.get("action")
                    if action == "ping":
                        await manager.send_personal_message({
                            "type": "pong",
                            "message": "Server received your ping!"
                        }, user_id)
                except json.JSONDecodeError:
                    pass # Ignore non-JSON messages
        except WebSocketDisconnect:
            await manager.disconnect(user_id, org_id)
            # Broadcast offline status
            await manager.broadcast_to_org({
                "type": "user_offline",
                "data": {"user_id": user_id}
            }, org_id)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011)
