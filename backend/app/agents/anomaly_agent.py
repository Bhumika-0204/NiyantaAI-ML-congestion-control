class AnomalyAgent:
    def __init__(self, spike_threshold: float = 2000, latency_threshold: float = 1000.0):
        # Spikes in request count or high latency
        self.spike_threshold = spike_threshold
        self.latency_threshold = latency_threshold
        
    def detect_anomaly(self, metrics: dict) -> bool:
        """
        Detect sudden traffic spikes and abnormal access patterns.
        """
        incoming = metrics.get('incoming_rate', 0)
        latency = metrics.get('latency', 0)
        
        if incoming > self.spike_threshold:
            return True
            
        if latency > self.latency_threshold:
            return True
            
        # Add support for complex isolation forests here in the future
            
        return False

anomaly_agent = AnomalyAgent()
