from app.plugins.base import BaseProtectionPlugin
from starlette.requests import Request
from starlette.responses import Response
from typing import Tuple, Optional
import logging

logger = logging.getLogger("PluginManager")

class PluginManager:
    def __init__(self):
        self.plugins = {}

    def register(self, name: str, plugin_instance: BaseProtectionPlugin):
        self.plugins[name] = plugin_instance
        logger.info(f"Registered plugin: {name}")

    def disable(self, name: str):
        if name in self.plugins:
            self.plugins[name].is_enabled = False

    def enable(self, name: str):
        if name in self.plugins:
            self.plugins[name].is_enabled = True

    async def execute_request_chain(self, request: Request, context: dict) -> Tuple[bool, Optional[Response]]:
        for name, plugin in self.plugins.items():
            if plugin.is_enabled:
                allowed, response = await plugin.process_request(request, context)
                if not allowed:
                    logger.warning(f"Plugin {name} blocked request from {request.client.host}")
                    return False, response
        return True, None

    async def execute_response_chain(self, request: Request, response: Response, context: dict) -> Response:
        for name, plugin in self.plugins.items():
            if plugin.is_enabled:
                response = await plugin.process_response(request, response, context)
        return response

plugin_manager = PluginManager()
