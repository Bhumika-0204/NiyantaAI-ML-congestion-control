import joblib
import pandas as pd
from app.core.config import settings

class PredictionAgent:
    def __init__(self):
        try:
            loaded_data = joblib.load(settings.MODEL_PATH)
            if isinstance(loaded_data, dict) and "model" in loaded_data:
                self.model = loaded_data["model"]
            else:
                self.model = loaded_data
            print("PredictionAgent: ML Model loaded successfully.")
        except Exception as e:
            print(f"Warning: PredictionAgent: Model not found at {settings.MODEL_PATH}. Using fallback heuristic logic. Error: {e}")
            self.model = None

    def predict_congestion(self, incoming_rate: float, queue_length: float, latency: float, error_rate: float, dropped_packets: float) -> float:
        if self.model is not None:
            features = pd.DataFrame([{
                "incoming_rate": incoming_rate,
                "queue_length": queue_length,
                "latency": latency,
                "error_rate": error_rate,
                "dropped_packets": dropped_packets
            }])
            
            expected_features = ["incoming_rate", "queue_length", "sent_packets", "dropped_packets"]
            for col in expected_features:
                if col not in features.columns:
                    features[col] = 0.0
            
            
            try:
                features_for_model = features[expected_features]
                probability = self.model.predict_proba(features_for_model)[0][1]
                return probability
            except Exception as e:
                print(f"⚠️ Prediction error: {e}")
                pass
        
        
        base_risk = min(1.0, (queue_length / 100.0) + (dropped_packets / 10.0) + (error_rate * 2))
        return base_risk

prediction_agent = PredictionAgent()
