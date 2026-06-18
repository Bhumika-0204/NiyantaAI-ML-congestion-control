from app.agents.base_agent import BaseAgent
from typing import Dict, Any

class RoutingAgent(BaseAgent):
    def __init__(self):
        super().__init__("RoutingAgent")

    async def act(self, local_state: Dict[str, Any]) -> Any:
        
        latency = local_state.get("latency", 50)
        
        
        if latency > 200:
            return "EU-WEST" 
        return "US-EAST" 

    async def learn(self, experience: Dict[str, Any]):
        pass
