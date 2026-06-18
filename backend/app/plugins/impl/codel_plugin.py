import time
from app.plugins.base import BaseProtectionPlugin
from starlette.requests import Request
from starlette.responses import Response
from typing import Tuple, Optional

class CoDelPlugin(BaseProtectionPlugin):
    def __init__(self, target_ms=5.0):
        super().__init__()
        self.target_ms = target_ms

    async def process_request(self, request: Request, context: dict) -> Tuple[bool, Optional[Response]]:
        
        context['codel_start_time'] = time.time()
        return True, None

    async def process_response(self, request: Request, response: Response, context: dict) -> Response:
        start_time = context.get('codel_start_time')
        if start_time:
            queue_delay_ms = (time.time() - start_time) * 1000
            codel_signal = "congested" if queue_delay_ms > self.target_ms else "clear"
            response.headers["X-Niyanta-CoDel"] = codel_signal
        return response
