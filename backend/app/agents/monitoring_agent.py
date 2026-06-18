import psutil
import time
from typing import Dict, Any

class MonitoringAgent:
    """
    Tracks ACTUAL live host OS device metrics to feed into the prediction engine.
    This effectively turns Niyanta AI into a real-time device traffic monitor.
    """
    def __init__(self):
        self.last_net_io = psutil.net_io_counters()
        self.last_time = time.time()
        
        
        self.active_requests = 0
        self.total_requests = 0
        
    def log_request(self):
        self.active_requests += 1
        self.total_requests += 1
        
    def end_request(self):
        if self.active_requests > 0:
            self.active_requests -= 1
            
    def collect_live_device_metrics(self) -> Dict[str, Any]:
        """
        Polls the OS for exact network usage differences over the last interval.
        Maps real hardware data to the predictive ML feature format.
        """
        current_time = time.time()
        current_net_io = psutil.net_io_counters()
        
        time_diff = current_time - self.last_time
        if time_diff == 0:
            time_diff = 1.0
            
        
        packets_recv_rate = (current_net_io.packets_recv - self.last_net_io.packets_recv) / time_diff
        bytes_recv_rate = (current_net_io.bytes_recv - self.last_net_io.bytes_recv) / time_diff
        
        
        drops = (current_net_io.dropin - self.last_net_io.dropin) + (current_net_io.dropout - self.last_net_io.dropout)
        errors = (current_net_io.errin - self.last_net_io.errin) + (current_net_io.errout - self.last_net_io.errout)
        cpu_load = psutil.cpu_percent()
        
        
        metrics = {
            "incoming_rate": float(packets_recv_rate),
            "queue_length": float(min(100.0, packets_recv_rate * 0.05)), 
            "latency": float(10.0 + (cpu_load * 2.5)), 
            "error_rate": float(errors),
            "dropped_packets": float(drops),
            "cpu_percent": cpu_load,
            "memory_percent": psutil.virtual_memory().percent,
            "bytes_recv_rate": bytes_recv_rate,
            "active_api_requests": self.active_requests
        }
        
        
        self.last_time = current_time
        self.last_net_io = current_net_io
        
        return metrics

monitor = MonitoringAgent()
