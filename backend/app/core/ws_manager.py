from fastapi import WebSocket
from typing import Dict, List, Any
import json

class ConnectionManager:
    def __init__(self):
        # active_connections[user_id] = WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # org_connections[org_id] = [user_id1, user_id2, ...]
        self.org_map: Dict[str, List[str]] = {}

    async def connect(self, user_id: Any, org_id: Any, websocket: WebSocket):
        u_id = str(user_id)
        o_id = str(org_id)
        await websocket.accept()
        self.active_connections[u_id] = websocket
        if o_id not in self.org_map:
            self.org_map[o_id] = []
        if u_id not in self.org_map[o_id]:
            self.org_map[o_id].append(u_id)

    def disconnect(self, user_id: Any, org_id: Any):
        u_id = str(user_id)
        o_id = str(org_id)
        if u_id in self.active_connections:
            del self.active_connections[u_id]
        if o_id in self.org_map and u_id in self.org_map[o_id]:
            self.org_map[o_id].remove(u_id)

    async def send_personal_message(self, message: Any, user_id: Any):
        u_id = str(user_id)
        if u_id in self.active_connections:
            websocket = self.active_connections[u_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast_to_org(self, message: Any, org_id: Any):
        o_id = str(org_id)
        if o_id in self.org_map:
            for u_id in self.org_map[o_id]:
                if u_id in self.active_connections:
                    await self.active_connections[u_id].send_text(json.dumps(message))

manager = ConnectionManager()
