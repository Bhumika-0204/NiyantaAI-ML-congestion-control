import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.agents.monitoring_agent import monitor
from app.agents.execution_agent import execution_agent
from app.services.rate_limiter import rate_limiter_manager
from app.core.logger import logger

class TrafficGatewayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host or "unknown"
        
        # 1. Ask Execution Agent for immediate verdict (cache lookup)
        action = execution_agent.get_action(client_ip)
        
        if action == "block":
            logger.warning(f"Gateway: Dropping request. IP {client_ip} is blocked.")
            return JSONResponse(status_code=403, content={"detail": "Traffic blocked by Niyanta AI."})
            
        is_throttled = (action == "throttle")
        
        # 2. Token Bucket Rate Limiting Enforcer
        if not rate_limiter_manager.is_allowed(client_ip, throttle=is_throttled):
            logger.warning(f"Gateway: Rate limiting activated. IP {client_ip} (Throttled mode: {is_throttled})")
            return JSONResponse(status_code=429, content={"detail": "Too many requests. Please slow down. Rate limit exceeded."})
        
        # 3. Request Monitoring Core
        monitor.log_request()
        start_time = time.time()
        
        try:
            response = await call_next(request)
        except Exception as e:
            monitor.end_request()
            logger.error(f"Gateway: Unhandled request error {e}")
            raise e
            
        process_time = (time.time() - start_time) * 1000 # convert to ms
        
        monitor.end_request()
        response.headers["X-Process-Time"] = str(round(process_time, 2))
        return response
