import psutil
import time
from collections import deque

class MonitoringAgent:
    def __init__(self):
        self.request_timestamps = deque(maxlen=1000)
        self.active_requests = 0
        self.total_requests = 0
        
    def log_request(self):
        now = time.time()
        self.request_timestamps.append(now)
        self.active_requests += 1
        self.total_requests += 1
        
    def end_request(self):
        if self.active_requests > 0:
            self.active_requests -= 1
            
    def get_system_metrics(self):
        now = time.time()
        # Clean up old timestamps (older than 1 sec to calculate incoming rate per sec)
        while self.request_timestamps and self.request_timestamps[0] < now - 1.0:
            self.request_timestamps.popleft()
            
        rate = len(self.request_timestamps)
        
        return {
            "cpu_percent": psutil.cpu_percent(interval=None),
            "memory_percent": psutil.virtual_memory().percent,
            "incoming_rate": rate,
            "active_requests": self.active_requests,
            "total_requests": self.total_requests
        }

monitor = MonitoringAgent()
