import time
from typing import Dict, Any, List
from collections import deque
from app.core.logger import logger

class ExecutionAgent:
    """
    Acts as a fast-access state cache. Currently using in-memory dicts,
    but cleanly abstracts the interface for a seamless Redis transition.
    Stores policy verdicts and manages the Deny-list for the Gateway.
    """
    def __init__(self):
        
        self.decision_cache: Dict[str, Dict[str, Any]] = {}
        self.blocklist = set()
        
        self.security_events: deque = deque(maxlen=100)
        
        self.total_blocked = 0
        self.total_throttled = 0
        self.total_allowed = 0
        
    def commit_decision(self, ip: str, action: str, ttl_seconds: int = 60, reason: str = ""):
        event = {
            "ip": ip,
            "action": action,
            "reason": reason or ("Anomaly detected" if action == "block" else "ML risk > threshold"),
            "timestamp": time.time(),
        }
        
        if action == "block":
            self.blocklist.add(ip)
            self.total_blocked += 1
            logger.warning(f"ExecutionAgent: IP {ip} permanently added to blocklist.")
        else:
            self.decision_cache[ip] = {
                "action": action,
                "expires_at": time.time() + ttl_seconds
            }
            self.total_throttled += 1
            logger.info(f"ExecutionAgent: Cached action '{action}' for IP {ip} (TTL: {ttl_seconds}s)")
        
        self.security_events.appendleft(event)
            
    def get_action(self, ip: str) -> str:
        if ip in self.blocklist:
            return "block"
            
        record = self.decision_cache.get(ip)
        if record:
            if time.time() < record["expires_at"]:
                return record["action"]
            else:
                del self.decision_cache[ip]
        
        self.total_allowed += 1
        return "allow"

    def get_security_summary(self) -> dict:
        """Returns live security data for the frontend dashboard."""
        now = time.time()
        
        recent_blocks = sum(
            1 for e in self.security_events
            if e["action"] == "block" and (now - e["timestamp"]) < 3600
        )
        total_decisions = max(self.total_allowed + self.total_blocked + self.total_throttled, 1)
        integrity = round(((total_decisions - self.total_blocked) / total_decisions) * 100, 1)
        
        
        events = []
        for e in list(self.security_events)[:20]:
            age_sec = now - e["timestamp"]
            if age_sec < 60:
                time_ago = f"{int(age_sec)}s ago"
            elif age_sec < 3600:
                time_ago = f"{int(age_sec // 60)} min ago"
            else:
                time_ago = f"{int(age_sec // 3600)}h ago"
            
            events.append({
                "ip": e["ip"],
                "reason": e["reason"],
                "timestamp": time_ago,
                "status": e["action"].upper(),
            })
        
        return {
            "blocked_last_hour": recent_blocks,
            "integrity_pct": integrity,
            "active_blocklist_size": len(self.blocklist),
            "active_throttle_count": len(self.decision_cache),
            "events": events,
        }

    def get_analytics(self) -> dict:
        """Returns live cumulative analytics for the Traffic Analytics chart."""
        return {
            "total_allowed": self.total_allowed,
            "total_throttled": self.total_throttled,
            "total_blocked": self.total_blocked,
        }

execution_agent = ExecutionAgent()
