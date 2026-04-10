"""
ECMP Equal-Cost Multi-Path Router for Niyanta AI
=================================================
Implements application-level weighted round-robin with:
  - Latency-weighted path selection (faster backends get more traffic)
  - Health-aware routing (dead paths removed from pool)
  - Exponential moving average latency tracking
"""

import time
import asyncio
import logging
import random
from typing import List, Dict, Optional

logger = logging.getLogger("ECMPRouter")


class BackendNode:
    """Represents one upstream backend replica."""
    def __init__(self, host: str, port: int, weight: int = 1):
        self.host = host
        self.port = port
        self.weight = weight
        self.base_url = f"http://{host}:{port}"
        self.alive = True
        self.latency_ms: float = 5.0
        self.failure_streak: int = 0

class ECMPLoadBalancer:
    """
    Latency-Weighted Smooth Round Robin (SWRR).
    Each backend gets a dynamic weight inversely proportional to its
    routing latency. Fast backends absorb more traffic.
    
    In Kubernetes: replaced by IPVS mode kube-proxy with wrr scheduler.
    """
    HEALTH_CHECK_INTERVAL = 10
    FAILURE_THRESHOLD = 3
    LATENCY_ALPHA = 0.2

    def __init__(self, backends: List[Dict]):
        self.nodes = [BackendNode(**b) for b in backends]

    def select_backend(self) -> Optional[BackendNode]:
        alive = [n for n in self.nodes if n.alive]
        if not alive:
            logger.error("ECMP: ALL backends DOWN.")
            return None
        weights = [max(1, int(1000 / max(n.latency_ms, 1.0))) for n in alive]
        total = sum(weights)
        pick = random.uniform(0, total)
        cumulative = 0
        for node, w in zip(alive, weights):
            cumulative += w
            if pick <= cumulative:
                return node
        return alive[0]

    def record_response(self, node: BackendNode, latency_ms: float, success: bool):
        if success:
            node.failure_streak = 0
            node.alive = True
            node.latency_ms = self.LATENCY_ALPHA * latency_ms + (1 - self.LATENCY_ALPHA) * node.latency_ms
        else:
            node.failure_streak += 1
            if node.failure_streak >= self.FAILURE_THRESHOLD:
                node.alive = False
                logger.warning(f"ECMP: {node.base_url} marked DEAD.")

    def get_status(self) -> List[Dict]:
        return [{"node": n.base_url, "alive": n.alive, "latency_ms": round(n.latency_ms, 2)} for n in self.nodes]

ecmp_router = ECMPLoadBalancer(backends=[
    {"host": "backend-0.niyanta-svc", "port": 8000},
    {"host": "backend-1.niyanta-svc", "port": 8000},
    {"host": "backend-2.niyanta-svc", "port": 8000},
])
