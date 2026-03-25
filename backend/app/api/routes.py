from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.agents.policy_agent import policy_agent
from app.agents.reasoning_agent import reasoning_agent
from app.services.rag_service import rag_service
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

@api_router.post("/analyze")
def analyze_traffic(payload: MetricsInput, request: Request):
    """
    Evaluates real-time metrics, invokes ML+Anomaly detection, and returns risk/action.
    Records decisions per IP via Policy Agent.
    """
    try:
        decision = policy_agent.evaluate_request(payload.ip, payload.metrics)
        return decision
    except Exception as e:
        logger.error(f"Error in /analyze: {e}")
        raise HTTPException(status_code=500, detail="Internal analysis error")

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
