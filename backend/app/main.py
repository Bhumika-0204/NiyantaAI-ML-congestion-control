import os
import sys


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import signal
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import api_router
from app.api.websockets import ws_router, live_device_monitoring_task
from app.middleware.gateway import TrafficGatewayMiddleware
from app.middleware.network_protection import NetworkProtectionMiddleware, trigger_connection_draining
from app.middleware.zero_trust import ZeroTrustMiddleware
from app.services.kafka_consumer import kafka_anomaly_consumer
from app.services.ecmp_router import ecmp_router
from app.plugins.manager import plugin_manager
from app.plugins.impl.red_plugin import REDPlugin
from app.plugins.impl.codel_plugin import CoDelPlugin


plugin_manager.register("RED", REDPlugin())
plugin_manager.register("CoDel", CoDelPlugin())

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    monitoring_task = asyncio.create_task(live_device_monitoring_task())
    
    kafka_task = asyncio.create_task(kafka_anomaly_consumer.start())
    
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            loop.add_signal_handler(sig, trigger_connection_draining)
        except NotImplementedError:
            pass  
    yield
    trigger_connection_draining()
    monitoring_task.cancel()
    kafka_task.cancel()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://niyanta-ai-ml-congestion-control-three.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(NetworkProtectionMiddleware)


app.add_middleware(ZeroTrustMiddleware)


app.add_middleware(TrafficGatewayMiddleware)

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/ws")

from app.api.explainability import router as explain_router
app.include_router(explain_router, prefix="/api/v2")

from app.api.chaos import router as chaos_router
app.include_router(chaos_router, prefix="/api/v1")

@app.get("/")
@app.head("/")
def root():
    return {"message": "Welcome to Niyanta AI API Gateway"}

@app.get("/metrics")
def get_metrics():
    from app.agents.monitoring_agent import monitor
    return monitor.live_metrics

@app.get("/ecmp-status")
def ecmp_status():
    """Returns ECMP backend health status for operational dashboards."""
    return {"backends": ecmp_router.get_status()}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
