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

    async def send_personal_message(self, message: dict, user_id: str):
        """
        Unified Routing: Always push to Redis Pub/Sub. 
        The local 'redis_listener' on EACH server instance will 
        deliver the message to 'active_connections' if the user is there.
        This prevents duplicate messages and supports multi-instance scaling.
        """
        try:
            # We wrap the message with extra metadata if needed
            broadcast_payload = {
                "user_id": user_id,
                "message": message
            }
            res = await redis.publish("ws_updates", json.dumps(broadcast_payload))
            print(f"--- [WS DEBUG] Published to Redis: {res} recipients notified via Pub/Sub ---")
        except Exception as e:
            print(f"--- [WS DEBUG] REDIS PUBLISH ERROR: {e} ---")

    async def broadcast_to_org(self, message: Any, org_id: Any):
        o_id = str(org_id)
        # Get all members of this org across ALL workers
        members = await redis.smembers(f"org_members:{o_id}")
        for u_id in members:
            # u_id is already a string because of decode_responses=True
            await self.send_personal_message(message, u_id)

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
                                target_user_id = data.get("user_id")
                                actual_msg = data.get("message")
                                
                                if target_user_id in self.active_connections:
                                    print(f"--- [WS DEBUG] Received via Pub/Sub: Delivering to LOCAL user {target_user_id} ---")
                                    for connection in self.active_connections[target_user_id]:
                                        try:
                                            await connection.send_json(actual_msg)
                                        except Exception as e:
                                            print(f"--- [WS DEBUG] Local WS send error in listener: {e} ---")
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

