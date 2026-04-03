import json
import asyncio
import logging
from typing import Dict, List, Any
from fastapi import WebSocket
from app.core.redis_client import redis

logger = logging.getLogger("erp_backend")

class ConnectionManager:
    def __init__(self):
        # Local cache of active WebSockets on THIS worker instance
        # Supporting multiple connections (tabs) for the same user
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: Any, org_id: Any, websocket: WebSocket):
        u_id = str(user_id)
        o_id = str(org_id)
        await websocket.accept()
        
        # Store local reference as a list
        if u_id not in self.active_connections:
            self.active_connections[u_id] = []
        self.active_connections[u_id].append(websocket)
        
        # Persist online status in Redis (with 1 hour expiry as heartbeat backup)
        await redis.setex(f"user_online:{u_id}", 3600, "1")
        # Track organization members in a Redis Set
        await redis.sadd(f"org_members:{o_id}", u_id)
        
        logger.info(f"User {u_id} connected to org {o_id} (Total connections: {len(self.active_connections[u_id])})")

    async def disconnect(self, user_id: Any, org_id: Any, websocket: WebSocket = None):
        u_id = str(user_id)
        o_id = str(org_id)
        
        if u_id in self.active_connections:
            if websocket in self.active_connections[u_id]:
                self.active_connections[u_id].remove(websocket)
            
            if not self.active_connections[u_id]:
                del self.active_connections[u_id]
                # Only remove Redis status if NO MORE tabs are open for this user
                await redis.delete(f"user_online:{u_id}")
            
        await redis.srem(f"org_members:{o_id}", u_id)
        logger.info(f"User {u_id} disconnected from org {o_id}")

    async def send_to_users(self, message: dict, user_ids: List[str]):
        """
        Bulk Delivery: Publishes ONE message to Redis for multiple recipients.
        This drastically improves performance for group chats and large voice notes.
        """
        if not user_ids:
            return
        try:
            payload = {
                "user_ids": user_ids,
                "message": message
            }
            res = await redis.publish("ws_updates", json.dumps(payload))
            # print(f"--- [WS DEBUG] Published to Redis: {res} recipients notified via Pub/Sub ---")
        except Exception as e:
            print(f"--- [WS DEBUG] REDIS PUBLISH ERROR: {e} ---")

    async def send_personal_message(self, message: dict, user_id: str):
        """LEGACY: Wraps send_to_users for a single user."""
        await self.send_to_users(message, [user_id])

    async def broadcast_to_org(self, message: Any, org_id: Any):
        o_id = str(org_id)
        # Get all members of this org across ALL workers
        members = await redis.smembers(f"org_members:{o_id}")
        if members:
            # members is a set from Redis, convert to list
            await self.send_to_users(message, list(members))

    async def is_user_online(self, user_id: Any) -> bool:
        return await redis.exists(f"user_online:{str(user_id)}") > 0

    async def redis_listener(self):
        """
        Background task that listens to Redis Pub/Sub and 
        delivers messages to users connected to THIS instance.
        Includes a self-healing retry loop.
        """
        retry_delay = 1
        while True:
            try:
                pubsub = redis.pubsub()
                await pubsub.subscribe("ws_updates")
                print("--- [WS DEBUG] Redis Pub/Sub listener STARTED ---")
                retry_delay = 1 # Reset retry delay on success
                
                try:
                    async for message in pubsub.listen():
                        if message["type"] == "message":
                            try:
                                data = json.loads(message["data"])
                                recipients = data.get("user_ids", [])
                                # Support legacy single user_id field
                                if not recipients and data.get("user_id"):
                                    recipients = [data.get("user_id")]
                                    
                                actual_msg = data.get("message")
                                
                                for target_user_id in recipients:
                                    if target_user_id in self.active_connections:
                                        to_remove = []
                                        for connection in self.active_connections[target_user_id]:
                                            try:
                                                await connection.send_json(actual_msg)
                                                if actual_msg and actual_msg.get("type") == "chat_message":
                                                    print(f"--- [WS SUCCESS] Delivered {actual_msg['type']} to user {target_user_id} ---")
                                            except Exception as e:
                                                print(f"--- [WS ERROR] Failed to send to {target_user_id}: {str(e)} ---")
                                                to_remove.append(connection)
                                        
                                        # Cleanup dead connections
                                        for conn in to_remove:
                                            try:
                                                self.active_connections[target_user_id].remove(conn)
                                            except: pass
                                        
                                        if target_user_id in self.active_connections and not self.active_connections[target_user_id]:
                                            del self.active_connections[target_user_id]
                                    else:
                                        if actual_msg and actual_msg.get("type") == "chat_message":
                                            print(f"--- [WS SKIP] User {target_user_id} NOT connected on this worker ---")
                            except Exception as e:
                                print(f"--- [WS DEBUG] Format error in Pub/Sub data: {e} ---")
                except Exception as e:
                    print(f"--- [WS DEBUG] REDIS SUBSCRIPTION DROPPED: {e} ---")
                finally:
                    try:
                        await pubsub.unsubscribe("ws_updates")
                        await pubsub.close()
                    except:
                        pass
            except Exception as e:
                print(f"--- [WS DEBUG] REDIS LISTENER CRASHED: {e}. Retrying in {retry_delay}s... ---")
                await asyncio.sleep(retry_delay)
                # Exponential backoff up to 30 seconds
                retry_delay = min(retry_delay * 2, 30)

manager = ConnectionManager()

