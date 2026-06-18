from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/explain/{request_id}")
async def explain_decision(request_id: str) -> Dict[str, Any]:
    
    
    feature_names = ["incoming_rate", "queue_length", "sent_packets", "dropped_packets"]
    
    
    
    
    shap_values = [0.45, 0.20, -0.15, 0.10]
    
    return {
        "request_id": request_id,
        "decision": "throttled",
        "contributing_features": dict(zip(feature_names, shap_values))
    }
