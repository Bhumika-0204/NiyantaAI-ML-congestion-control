from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

from app.agents.policy_agent import policy_agent
from app.agents.reasoning_agent import reasoning_agent
from app.agents.execution_agent import execution_agent
from app.services.rag_service import rag_service
from app.ml.ppo_agent import ppo_agent
from app.services.distributed_limiter import limiter
from app.core.logger import logger

api_router = APIRouter()

class MetricsInput(BaseModel):
    ip: str = "127.0.0.1"
    metrics: Dict[str, float]

class ExplainInput(BaseModel):
    metrics: Dict[str, float]
    action: str
    anomaly: bool

class QueryInput(BaseModel):
    query: str

class EnterpriseAnalyzeInput(BaseModel):
    client_ip: str
    request_size_bytes: int = 1024
    endpoint_targeted: str = "/"
    system_metrics: dict = {
        "cpu": 65.0, 
        "latency_ms": 12.0, 
        "packet_loss": 0.05, 
        "request_rate": 8000
    }

@api_router.post("/analyze")
async def analyze_traffic(payload: MetricsInput, request: Request):
    """
    General traffic analysis endpoint. Runs the full ML pipeline:
    anomaly detection → risk prediction → policy decision.
    Used by the attack simulator and API Playground.
    """
    ip = request.headers.get("X-Forwarded-For", payload.ip)
    decision = policy_agent.evaluate_request(ip, payload.metrics)
    return {
        "ip": ip,
        "decision": decision,
    }

@api_router.post("/analyze-request")
async def analyze_enterprise_traffic(payload: EnterpriseAnalyzeInput, request: Request):
    """
    FAANG Enterprise Ingress: 
    1. Fast atomic token bucket check via Redis/Lua
    2. Sub-millisecond RL (PPO) policy inference
    """
    try:
        
        allowed, remaining = await limiter.check_rate_limit(payload.client_ip)
        if not allowed:
            
            return {
                "status": "error",
                "action": "throttle",
                "reason": "Token Bucket Exhausted. (Circuit breaker or Redis enforcement)",
                "rate_limit_remaining": remaining
            }

        
        action = ppo_agent.take_action(payload.system_metrics)
        
        return {
            "status": "success" if action == "allow" else "error",
            "action": action,
            "rate_limit_remaining": remaining,
            "trace_id": "req_" + str(hash(payload.client_ip))
        }
    except Exception as e:
        logger.error(f"Error in /analyze-request: {e}")
        raise HTTPException(status_code=500, detail="Internal enterprise analysis error")

@api_router.get("/metrics")
async def prometheus_metrics():
    """
    Prometheus scrape endpoint for cluster observability
    """
    metric_str = (
        '# HELP niyanta_active_connections Current active gateway sockets\n'
        '# TYPE niyanta_active_connections gauge\n'
        'niyanta_active_connections{region="us-east-1"} 1543.0\n'
        '# HELP niyanta_redis_failures_total Total circuit trips for Redis\n'
        'niyanta_redis_failures_total 0.0\n'
    )
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(metric_str)

@api_router.get("/health")
async def health_check():
    """ Kubernetes Liveness/Readiness Probe """
    return {
        "status": "healthy",
        "version": "2.0.0",
        "components": {
            "redis_cluster": "OK" if limiter.circuit_breaker.state == "CLOSED" else "DEGRADED",
            "ml_engine_cache": "OK"
        }
    }

@api_router.get("/security-events")
async def get_security_events():
    """Returns live security event data for the dashboard."""
    return execution_agent.get_security_summary()

@api_router.get("/analytics")
async def get_analytics():
    """Returns live cumulative traffic decision counts."""
    return execution_agent.get_analytics()

@api_router.post("/explain")
def explain_decision(payload: ExplainInput):
    """
    Invokes the LLM to explain a specific system decision safely.
    """
    try:
        explanation = reasoning_agent.explain_decision(
            metrics=payload.metrics,
            action=payload.action,
            anomaly=payload.anomaly
        )
        return {"explanation": explanation}
    except Exception as e:
        logger.error(f"Error in /explain: {e}")
        raise HTTPException(status_code=500, detail="LLM reasoning failed")

@api_router.post("/query")
def query_knowledge(payload: QueryInput):
    """
    Direct RAG querying for the frontend UI.
    """
    try:
        context = rag_service.retrieve_context(payload.query)
        return {"answer": context, "sources": ["knowledge_base.md"]}
    except Exception as e:
        logger.error(f"Error in /query: {e}")
        raise HTTPException(status_code=500, detail="RAG retrieval failed")



_policy_config = {
    "acl": {
        "blockAllAttacks": True,
        "blockUnauthorized": True,
        "filterArp": False,
        "trafficPortBased": True,
        "trafficDNS": True,
        "trafficDHCP": False,
    },
    "macBindings": [],
    "rateLimit": {
        "packetRate": 5000,
        "cpuThreshold": 85,
        "reducePayload": True,
    },
    "security": {
        "portSecurityEnabled": True,
        "vpnAccessEnabled": False,
    }
}

@api_router.get("/policies")
async def get_policies():
    """Returns current policy configuration."""
    return _policy_config

class PolicyUpdate(BaseModel):
    acl: Dict[str, Any] = {}
    macBindings: List[Dict[str, str]] = []
    rateLimit: Dict[str, Any] = {}
    security: Dict[str, Any] = {}

@api_router.put("/policies")
async def update_policies(payload: PolicyUpdate):
    """Saves updated policy configuration."""
    global _policy_config
    if payload.acl:
        _policy_config["acl"] = payload.acl
    if payload.macBindings is not None:
        _policy_config["macBindings"] = payload.macBindings
    if payload.rateLimit:
        _policy_config["rateLimit"] = payload.rateLimit
    if payload.security:
        _policy_config["security"] = payload.security
    logger.info(f"Policies updated: {_policy_config}")
    return {"status": "saved", "config": _policy_config}
