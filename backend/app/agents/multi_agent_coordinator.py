import asyncio
from app.agents.congestion_agent import CongestionAgent
from app.agents.anomaly_agent import anomaly_agent
from app.agents.routing_agent import RoutingAgent

class MultiAgentCoordinator:
    def __init__(self):
        self.congestion_agent = CongestionAgent()
        self.routing_agent = RoutingAgent()
        self.anomaly_agent = anomaly_agent
        
    async def get_joint_action(self, request_features: dict) -> dict:
        local_state = request_features
        
        # Async execution of all agents
        c_action, r_action, a_action = await asyncio.gather(
            self.congestion_agent.act(local_state),
            self.routing_agent.act(local_state),
            self.anomaly_agent.act(local_state)
        )
        return {"throttle_limit": c_action, "route_target": r_action, "strictness": a_action}

coordinator = MultiAgentCoordinator()
