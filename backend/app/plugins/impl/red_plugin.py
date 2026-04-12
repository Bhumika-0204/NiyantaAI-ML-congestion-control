from app.plugins.base import BaseProtectionPlugin
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from typing import Tuple, Optional
import random
import logging

logger = logging.getLogger("REDPlugin")

class REDPlugin(BaseProtectionPlugin):
    def __init__(self, min_threshold=0.5, max_threshold=0.85):
        super().__init__()
        self.min_threshold = min_threshold
        self.max_threshold = max_threshold

    async def process_request(self, request: Request, context: dict) -> Tuple[bool, Optional[Response]]:
        is_premium = context.get('is_premium', False)
        cpu_load = context.get('cpu_load', 0.5)

        if is_premium or cpu_load < self.min_threshold:
            return True, None
            
        if cpu_load >= self.max_threshold:
            return False, JSONResponse(
                status_code=503,
                headers={"Retry-After": "3"},
                content={"detail": "RED: Early congestion drop. Queue filling — reduce send rate."}
            )

        drop_prob = (cpu_load - self.min_threshold) / (self.max_threshold - self.min_threshold)
        if random.random() < drop_prob:
            client_ip = request.client.host if request.client else "unknown"
            logger.warning(f"RED: Probabilistic early drop for {client_ip} at load={cpu_load:.2f}")
            return False, JSONResponse(
                status_code=503,
                headers={"Retry-After": "3"},
                content={"detail": "RED: Early congestion drop. Queue filling — reduce send rate."}
            )
            
        return True, None
