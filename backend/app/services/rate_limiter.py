import time
from threading import Lock

class TokenBucket:
    def __init__(self, capacity: int, fill_rate: float):
        self.capacity = capacity
        self.fill_rate = fill_rate
        self.tokens = capacity
        self.last_fill = time.time()
        self.lock = Lock()

    def consume(self, tokens: int = 1) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_fill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)
            self.last_fill = now
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

class RateLimiterManager:
    """
    Manages token buckets per IP.
    In a distributed production environment, this would interface with Redis via Lua scripts.
    """
    def __init__(self, default_capacity: int = 100, default_fill_rate: float = 10.0):
        self.buckets = {}
        self.default_capacity = default_capacity
        self.default_fill_rate = default_fill_rate
        self.lock = Lock()
        
    def get_bucket(self, ip: str) -> TokenBucket:
        with self.lock:
            if ip not in self.buckets:
                self.buckets[ip] = TokenBucket(self.default_capacity, self.default_fill_rate)
            return self.buckets[ip]
            
    def is_allowed(self, ip: str, throttle: bool = False) -> bool:
        bucket = self.get_bucket(ip)
        # Throttled state demands a higher token cost per request, effectively shedding load
        cost = 10 if throttle else 1
        return bucket.consume(cost)

rate_limiter_manager = RateLimiterManager()
