from fastapi import APIRouter
from typing import Dict

router = APIRouter()

class ChaosState:
    redis_down: bool = False
    kafka_lag: int = 0
    ml_latency: int = 0
    
chaos_state = ChaosState()

@router.post("/chaos/toggle_redis")
async def toggle_redis(fail: bool) -> Dict[str, str]:
    """ Simulate Redis downtime for distributed rate limiter fallback testing """
    chaos_state.redis_down = fail
    return {"status": f"Redis failure state: {fail}"}

@router.post("/chaos/set_latency")
async def set_kafka_lag(lag_ms: int) -> Dict[str, str]:
    """ Simulate Kafka consumer lag or ML inference latency """
    chaos_state.ml_latency = lag_ms
    return {"status": f"System backend latency induced: {lag_ms}ms"}
