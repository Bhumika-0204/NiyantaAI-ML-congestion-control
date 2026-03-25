import os
import sys

# Ensure the backend directory is in the PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.middleware.gateway import TrafficGatewayMiddleware

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API Gateway Interceptor
app.add_middleware(TrafficGatewayMiddleware)

from app.api.routes import api_router
from app.api.websockets import ws_router

app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/ws")

@app.get("/")
def root():
    return {"message": "Welcome to Niyanta AI API Gateway"}

@app.get("/metrics")
def get_metrics():
    from app.agents.monitoring_agent import monitor
    return monitor.get_system_metrics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
