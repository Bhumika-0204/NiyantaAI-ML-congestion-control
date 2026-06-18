import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

from app.agents.monitoring_agent import monitor
from app.agents.multi_agent_coordinator import coordinator
from app.agents.policy_agent import policy_agent
from app.core.logger import logger

ws_router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket client {client_id} connected.")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket client {client_id} disconnected.")

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

async def live_device_monitoring_task():
    """
    Background worker that continuously pools the host's actual network traffic,
    evaluates it using the ML Policy Agent, and streams it to the dashboard.
    """
    while True:
        if manager.active_connections: 
            metrics = monitor.collect_live_device_metrics()
            
            
            
            agent_decision = await coordinator.get_joint_action(metrics)
            decision = policy_agent.evaluate_request("HOST_DEVICE", metrics)
            
            payload = {
                "metrics": metrics,
                "multi_agent_decision": agent_decision,
                "decision": decision,
                "anomaly_score": agent_decision.get("strictness", 0),
                "active_connections": len(manager.active_connections)
            }
            await manager.broadcast(payload)
            
        await asyncio.sleep(1.0) 

@ws_router.websocket("/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(client_id)
