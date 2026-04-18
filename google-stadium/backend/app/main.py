from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import json
from .database import engine, Base, get_db
from .models import User, VendorProfile
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from contextlib import asynccontextmanager

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        for connection in self.active_connections.values():
            try:
                await connection.send_text(payload)
            except Exception:
                pass

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message))
            except Exception:
                pass

class ChatConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        if websocket not in self.active_connections:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                pass

manager = ConnectionManager()
chat_manager = ChatConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Google Stadium API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import orders, map, auth, vendors
app.include_router(orders.router)
app.include_router(map.router)
app.include_router(auth.router)
app.include_router(vendors.router)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Ignore incoming text for now, keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(client_id)

gate_status = {
    1: "Low Traffic",
    2: "Medium Traffic",
    3: "High Traffic",
    4: "Low Traffic"
}

@app.get("/gates/status")
async def get_gates_status():
    return gate_status

class GateUpdateSchema(BaseModel):
    status: str

@app.put("/gates/{gate_id}")
async def update_gate(gate_id: int, gate_update: GateUpdateSchema):
    if gate_id in gate_status:
        gate_status[gate_id] = gate_update.status
        await manager.broadcast({
            "type": "GATE_UPDATE",
            "data": {
                "gate_id": gate_id,
                "status": gate_update.status
            }
        })
        return {"message": "Gate updated"}
    return {"error": "Gate not found"}

@app.websocket("/ws/chat/{client_id}")
async def websocket_chat_endpoint(websocket: WebSocket, client_id: str, db: AsyncSession = Depends(get_db)):
    await chat_manager.connect(websocket)
    try:
        # Securely identify user from DB
        result = await db.execute(select(User).where(User.id == int(client_id)))
        user = result.scalars().first()
        if not user:
            await websocket.close()
            return
            
        role_str = user.role.value if hasattr(user.role, 'value') else user.role
        
        sender_meta = f"{user.username} (Fan)"
        if role_str == "admin":
            sender_meta = f"{user.username} (Admin)"
        elif role_str == "vendor" and hasattr(user, 'vendor_profile') and user.vendor_profile:
            sender_meta = f"{user.username} ({user.vendor_profile.store_name})"
        elif role_str == "vendor":
            sender_meta = f"{user.username} (Vendor)"

        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                # Override untrusted payload values
                msg_data["sender_meta"] = sender_meta
                msg_data["sender"] = user.username
                msg_data["role"] = role_str
                await chat_manager.broadcast(msg_data)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        chat_manager.disconnect(websocket)
