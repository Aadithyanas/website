import json
import asyncio
import logging
from typing import Dict, List, Any, Set
from fastapi import WebSocket

logger = logging.getLogger("erp_backend")

class ConnectionManager:
    def __init__(self):
        # Local cache of active WebSockets on THIS worker instance
        # Supporting multiple connections (tabs) for the same user
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Track which users belong to which organization locally
        self.org_members: Dict[str, Set[str]] = {}
        # Track online status locally
        self.online_users: Set[str] = set()

    async def connect(self, user_id: Any, org_id: Any, websocket: WebSocket):
        u_id = str(user_id)
        o_id = str(org_id)
        await websocket.accept()
        
        # Store local reference as a list
        if u_id not in self.active_connections:
            self.active_connections[u_id] = []
        self.active_connections[u_id].append(websocket)
        
        # Track online status locally
        self.online_users.add(u_id)
        
        # Track organization members locally
        if o_id not in self.org_members:
            self.org_members[o_id] = set()
        self.org_members[o_id].add(u_id)
        
        logger.info(f"User {u_id} connected to org {o_id} (Total connections: {len(self.active_connections[u_id])})")

    async def disconnect(self, user_id: Any, org_id: Any, websocket: WebSocket = None):
        u_id = str(user_id)
        o_id = str(org_id)
        
        if u_id in self.active_connections:
            if websocket in self.active_connections[u_id]:
                self.active_connections[u_id].remove(websocket)
            
            if not self.active_connections[u_id]:
                del self.active_connections[u_id]
                # Remove online status
                if u_id in self.online_users:
                    self.online_users.remove(u_id)
                # Remove from org members
                if o_id in self.org_members and u_id in self.org_members[o_id]:
                    self.org_members[o_id].remove(u_id)
                    if not self.org_members[o_id]:
                        del self.org_members[o_id]
            
        logger.info(f"User {u_id} disconnected from org {o_id}")

    async def send_to_users(self, message: dict, user_ids: List[str]):
        """
        Local Delivery: Sends message directly to connected websockets.
        """
        if not user_ids:
            return
            
        for target_user_id in user_ids:
            if target_user_id in self.active_connections:
                to_remove = []
                for connection in self.active_connections[target_user_id]:
                    try:
                        await connection.send_json(message)
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
                    if target_user_id in self.online_users:
                        self.online_users.remove(target_user_id)

    async def send_personal_message(self, message: dict, user_id: str):
        await self.send_to_users(message, [user_id])

    async def broadcast_to_org(self, message: Any, org_id: Any):
        o_id = str(org_id)
        # Get all members of this org currently connected
        if o_id in self.org_members:
            members = list(self.org_members[o_id])
            await self.send_to_users(message, members)

    async def is_user_online(self, user_id: Any) -> bool:
        return str(user_id) in self.online_users

manager = ConnectionManager()
