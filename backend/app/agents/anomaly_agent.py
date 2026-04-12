from app.agents.base_agent import BaseAgent
from typing import Dict, Any

class AnomalyAgent(BaseAgent):
    def __init__(self, spike_threshold: float = 2000, latency_threshold: float = 1000.0):
        super().__init__("AnomalyAgent")
        self.spike_threshold = spike_threshold
        self.latency_threshold = latency_threshold

    def detect_anomaly(self, metrics: dict) -> bool:
        incoming = metrics.get('incoming_rate', 0)
        latency = metrics.get('latency', 0)
        if incoming > self.spike_threshold or latency > self.latency_threshold:
            return True
        return False

    async def act(self, local_state: Dict[str, Any]) -> Any:
        # Output: strictness threshold for Isolation Forest
        error_rate = local_state.get("error_rate", 0.0)
        
        # If error rate spikes, tighten the threshold
        if error_rate > 0.1:
            return 0.8 # Very strict
        return 0.5 # Normal

    async def learn(self, experience: Dict[str, Any]):
        pass

anomaly_agent = AnomalyAgent()
