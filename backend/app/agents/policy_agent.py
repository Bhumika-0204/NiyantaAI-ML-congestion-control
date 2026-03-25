from app.agents.prediction_agent import prediction_agent
from app.agents.anomaly_agent import anomaly_agent
from app.agents.execution_agent import execution_agent
from app.core.logger import logger

class PolicyAgent:
    def __init__(self, risk_threshold: float = 0.75):
        self.risk_threshold = risk_threshold
        
    def evaluate_request(self, ip: str, metrics: dict) -> dict:
        """
        Combines ML prediction and Anomaly detection logic.
        Validates rules and commits the decision to the Execution Agent.
        """
        # 1. Anomaly Detection
        is_anomaly = anomaly_agent.detect_anomaly(metrics)
        
        # 2. Extract specific features
        incoming_rate = metrics.get("incoming_rate", 0)
        queue_length = metrics.get("queue_length", 0)
        latency = metrics.get("latency", 0)
        error_rate = metrics.get("error_rate", 0)
        dropped_packets = metrics.get("dropped_packets", 0)
        
        # 3. ML Prediction processing
        risk_score = prediction_agent.predict_congestion(
            incoming_rate=incoming_rate,
            queue_length=queue_length,
            latency=latency,
            error_rate=error_rate,
            dropped_packets=dropped_packets
        )
        
        # 4. Strict Deterministic Policy Logic
        action = "allow"
        if is_anomaly:
            action = "block"
        elif risk_score > self.risk_threshold:
            action = "throttle"
            
        # 5. Commit to execution layer cache
        if action != "allow":
            execution_agent.commit_decision(ip, action, ttl_seconds=60)
            logger.info(f"PolicyAgent: Decision '{action}' logged for IP {ip}. ML Risk: {risk_score:.2f}")
            
        return {
            "risk_score": float(risk_score),
            "anomaly": is_anomaly,
            "action": action
        }

policy_agent = PolicyAgent()
