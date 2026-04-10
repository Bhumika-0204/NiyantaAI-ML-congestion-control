import numpy as np
import logging
from sklearn.ensemble import IsolationForest
from typing import Dict, Any

logger = logging.getLogger("AnomalyDetectionService")

class AnomalyDetectionService:
    """
    Production-grade DDoS and traffic spike detector using Isolation Forest.
    
    Isolation Forest works by isolating anomalies (outliers) rather than profiling 
    "normal" data. It's ideal for streaming network traffic because:
    - It's extremely fast at inference time (sub-ms).
    - It requires no labeled data (unsupervised). You don't need historical DDoS records.
    - It handles high-dimensional network feature spaces elegantly.
    
    Integration flow:
    ┌──────────────┐     Kafka Topic      ┌─────────────────────────┐
    │ API Gateway  │ ──[request_logs]───> │ Anomaly Consumer Worker │
    │  (FastAPI)   │                      │ (This Service)          │
    └──────────────┘                      └────────────┬────────────┘
                                                       │ Publish to
                                                       ▼ anomaly_events
                                          ┌────────────────────────┐
                                          │ Kafka: anomaly_events  │
                                          │  → Gateway IP Ban List │
                                          └────────────────────────┘
    """
    
    def __init__(self):
        """
        Initializes with a pre-fit IsolationForest model.
        In production, this model is trained nightly on Kafka stream data 
        and its sklearn artifact is versioned in MLflow.
        """
        # contamination = expected fraction of anomalies in traffic.
        # 0.05 = we expect ~5% of traffic to be malicious/anomalous.
        self.model = IsolationForest(
            n_estimators=100,  
            contamination=0.05,
            random_state=42,
            n_jobs=-1  # Use all available CPU cores at inference time
        )
        
        # Warm-up: In production, we load from MLflow artifact registry.
        # Here we seed with synthetic "normal" traffic for demonstration.
        self._warm_up_with_baseline_traffic()
        logger.info("IsolationForest Anomaly Detector initialized and warm-up complete.")

    def _warm_up_with_baseline_traffic(self):
        """
        Approximates "normal network baseline" for the decision boundary.
        This is replaced in production with real historical Kafka data.
        """
        np.random.seed(42)
        # Feature vector: [cpu%, latency_ms, packet_loss, request_rate, payload_bytes]
        baseline_traffic = np.column_stack([
            np.random.normal(45, 15, 5000),      # CPU 20-70% normal
            np.random.normal(25, 10, 5000),       # Latency 15-35ms normal
            np.random.normal(0.02, 0.01, 5000),   # Packet loss < 5% normal
            np.random.normal(5000, 1500, 5000),   # 2000-8000 req/s normal range
            np.random.normal(512, 200, 5000),     # Payload sizes 100-900 bytes normal
        ])
        self.model.fit(np.clip(baseline_traffic, 0, None))

    def extract_features(self, telemetry: Dict[str, Any]) -> np.ndarray:
        """
        Maps raw gateway telemetry dictionary into the Isolation Forest feature vector.
        Keep this mapping consistent with the training pipeline in MLOPS_PIPELINE.md.
        """
        return np.array([
            telemetry.get("cpu", 0.0),
            telemetry.get("latency_ms", 0.0),
            telemetry.get("packet_loss", 0.0),
            telemetry.get("request_rate", 0.0),
            telemetry.get("payload_bytes", 512.0),
        ]).reshape(1, -1)

    def analyze(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Core entry point for the Kafka Consumer / Policy Agent.
        Returns a structured verdict for the Gateway's Action Engine.
        """
        features = self.extract_features(telemetry)
        
        # score_samples returns negative values: more negative = more anomalous.
        # -0.5 and below is a strong anomaly indicator for FAANG-scale traffic.
        anomaly_score = self.model.score_samples(features)[0]
        prediction = self.model.predict(features)[0]  # -1 = anomaly, 1 = normal
        
        is_anomaly = prediction == -1
        threat_level = "CRITICAL" if anomaly_score < -0.5 else ("HIGH" if is_anomaly else "NORMAL")
        
        result = {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(float(anomaly_score), 4),
            "threat_level": threat_level,
        }
        
        if is_anomaly:
            logger.warning(
                f"ANOMALY DETECTED | Score: {anomaly_score:.4f} | "
                f"Threat: {threat_level} | Metrics: cpu={telemetry.get('cpu')}% "
                f"req_rate={telemetry.get('request_rate')}"
            )
        
        return result

# Singleton for FastAPI / Kafka Consumer dependency injection
anomaly_detector = AnomalyDetectionService()
