import time
from typing import Dict, Any
from app.core.logger import logger

class ExecutionAgent:
    """
    Acts as a fast-access state cache. Currently using in-memory dicts,
    but cleanly abstracts the interface for a seamless Redis transition.
    Stores policy verdicts and manages the Deny-list for the Gateway.
    """
    def __init__(self):
        # Format: IP -> { "action": "throttle|block", "expires_at": float }
        self.decision_cache: Dict[str, Dict[str, Any]] = {}
        self.blocklist = set()
        
    def commit_decision(self, ip: str, action: str, ttl_seconds: int = 60):
        if action == "block":
            self.blocklist.add(ip)
            logger.warning(f"ExecutionAgent: IP {ip} permanently added to blocklist.")
        else:
            self.decision_cache[ip] = {
                "action": action,
                "expires_at": time.time() + ttl_seconds
            }
            logger.info(f"ExecutionAgent: Cached action '{action}' for IP {ip} (TTL: {ttl_seconds}s)")
            
    def get_action(self, ip: str) -> str:
        if ip in self.blocklist:
            return "block"
            
        record = self.decision_cache.get(ip)
        if record:
            if time.time() < record["expires_at"]:
                return record["action"]
            else:
                del self.decision_cache[ip]
                
        return "allow"

execution_agent = ExecutionAgent()
