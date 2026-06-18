from app.agents.base_agent import BaseAgent
from typing import Dict, Any

class CongestionAgent(BaseAgent):
    def __init__(self):
        super().__init__("CongestionAgent")

    async def act(self, local_state: Dict[str, Any]) -> Any:
        
        cpu_load = local_state.get("cpu_load", 0.5)
        
        
        
        if cpu_load > 0.8:
            return 10 
        elif cpu_load > 0.5:
            return 50 
        else:
            return 1000 

    async def learn(self, experience: Dict[str, Any]):
        pass
