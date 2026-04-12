import abc
from starlette.requests import Request
from starlette.responses import Response
from typing import Optional, Tuple

class BaseProtectionPlugin(abc.ABC):
    def __init__(self):
        self.is_enabled = True

    @abc.abstractmethod
    async def process_request(self, request: Request, context: dict) -> Tuple[bool, Optional[Response]]:
        """
        Process incoming request.
        Return (True, None) to allow.
        Return (False, Response object) to immediately block/respond.
        """
        pass

    async def process_response(self, request: Request, response: Response, context: dict) -> Response:
        """
        Post-process outgoing response (e.g., adding headers).
        """
        return response
