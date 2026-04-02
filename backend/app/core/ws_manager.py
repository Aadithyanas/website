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
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: Any, org_id: Any, websocket: WebSocket):
        u_id = str(user_id)
        o_id = str(org_id)
        await websocket.accept()
        
        # Store local reference
        self.active_connections[u_id] = websocket
        
        # Persist online status in Redis (with 1 hour expiry as heartbeat backup)
        await redis.setex(f"user_online:{u_id}", 3600, "1")
        # Track organization members in a Redis Set
        await redis.sadd(f"org_members:{o_id}", u_id)
        
        logger.info(f"User {u_id} connected to org {o_id}")

    async def disconnect(self, user_id: Any, org_id: Any):
        u_id = str(user_id)
        o_id = str(org_id)
        
        if u_id in self.active_connections:
            del self.active_connections[u_id]
            
        await redis.delete(f"user_online:{u_id}")
        await redis.srem(f"org_members:{o_id}", u_id)
        
        logger.info(f"User {u_id} disconnected from org {o_id}")

    async def send_personal_message(self, message: Any, user_id: Any):
        u_id = str(user_id)
        if u_id in self.active_connections:
            # User is on this instance, send directly
            try:
                await self.active_connections[u_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending local message to {u_id}: {e}")
        else:
            # User might be on another instance, publish to Redis
            payload = {
                "user_id": u_id,
                "message": message
            }
            await redis.publish("ws_updates", json.dumps(payload))

    async def broadcast_to_org(self, message: Any, org_id: Any):
        o_id = str(org_id)
        # Get all members of this org across ALL workers
        members = await redis.smembers(f"org_members:{o_id}")
        for u_id in members:
            await self.send_personal_message(message, u_id)

    async def is_user_online(self, user_id: Any) -> bool:
        return await redis.exists(f"user_online:{str(user_id)}") > 0

    async def redis_listener(self):
        """
        Background task that listens for messages published to Redis 
        and delivers them to local WebSockets.
        """
        pubsub = redis.pubsub()
        await pubsub.subscribe("ws_updates")
        
        logger.info("Started Redis Pub/Sub listener for WebSockets")
        
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    target_user_id = data.get("user_id")
                    actual_message = data.get("message")
                    
                    if target_user_id in self.active_connections:
                        try:
                            await self.active_connections[target_user_id].send_text(json.dumps(actual_message))
                        except Exception as e:
                            logger.error(f"Failed to deliver Pub/Sub message to {target_user_id}: {e}")
        except Exception as e:
            logger.error(f"Redis Pub/Sub listener encountered error: {e}")
        finally:
            await pubsub.unsubscribe("ws_updates")

manager = ConnectionManager()
