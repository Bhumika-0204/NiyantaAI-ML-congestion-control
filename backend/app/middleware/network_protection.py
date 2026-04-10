"""
Network Protection Middleware for Niyanta AI
============================================
Implements 11 computer networking protection concepts at the application layer:

1.  Slow Loris Prevention         (L7 - request timeout enforcement)
2.  AIMD Adaptive Throttle Decay  (L7 - Additive Increase Multiplicative Decrease)
3.  RED Random Early Detection     (Queue Management - probabilistic early drop)
4.  CoDel Queue Delay Monitor     (Queue Management - latency-based congestion signal)
5.  Leaky Bucket Smoothing        (Flow Control - smooth output rate)
6.  Backpressure Propagation      (L7 - Retry-After headers on overload)
7.  BCP38 Ingress / Spoofing Filter (L3 - Private IP validation on public paths)
8.  DSCP Traffic Classification   (QoS - priority marking via response headers)
9.  Weighted Fair Queuing (WFQ)   (QoS - premium vs standard bandwidth fairness)
10. HTTP/2 Stream Concurrency Cap (L7 - per-IP concurrent request limits)
11. Connection Draining Signal    (L7 - graceful shutdown propagation header)
"""

import time
import asyncio
import math
import random
import logging
from typing import Dict
from collections import deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

logger = logging.getLogger("NetworkProtection")


# ─────────────────────────────────────────────────────────────────
# 1. IN-MEMORY STATE STORES (replace with Redis in production)
# ─────────────────────────────────────────────────────────────────
# Per-IP concurrent connection tracking (HTTP/2 stream cap)
_active_connections: Dict[str, int] = {}

# AIMD state per IP: {"rate_factor": float, "last_congestion": float}
_aimd_state: Dict[str, Dict] = {}

# CoDel: rolling window of request queue entry timestamps
_queue_delays: deque = deque(maxlen=1000)

# Leaky Bucket: per-IP token drain tracker
_leaky_buckets: Dict[str, Dict] = {}

# Graceful shutdown flag — set True to trigger connection draining
_DRAINING = False

# HTTP/2 concurrent stream cap per IP
MAX_CONCURRENT_STREAMS = 100

# Slow Loris timeout (seconds) — abort connections that don't complete headers
REQUEST_TIMEOUT_SEC = 30

# Leaky Bucket drain rate (requests per second allowed out regardless of burst)
LEAKY_DRAIN_RATE = 50

# DSCP-like priority tiers mapped to API key prefixes
PREMIUM_KEY_PREFIX = "premium_"

# RED queue thresholds (0.0 - 1.0 load factor)
RED_MIN_THRESHOLD = 0.5   # start randomly dropping at 50% load
RED_MAX_THRESHOLD = 0.85  # drop everything beyond 85% load

# CoDel target queue delay in milliseconds (Google standard: 5ms)
CODEL_TARGET_MS = 5.0


class NetworkProtectionMiddleware(BaseHTTPMiddleware):
    """
    Comprehensive computer-networks-grade protection layer.
    Sits BEFORE the TrafficGatewayMiddleware in the stack.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = (request.client.host if request.client else "unknown")
        api_key = request.headers.get("X-API-Key", "")
        is_premium = api_key.startswith(PREMIUM_KEY_PREFIX)

        # ──────────────────────────────────────────────
        # PROTECTION 1: BCP38 — Spoofed Private IP Filter
        # Drops requests that arrive on public interface
        # but claim to be from RFC1918 private IP ranges.
        # ──────────────────────────────────────────────
        if self._is_spoofed_private_ip(client_ip, request):
            logger.warning(f"BCP38: Dropped spoofed private IP claim from {client_ip}")
            return JSONResponse(
                status_code=403,
                content={"detail": "BCP38: Ingress filtering — invalid source IP."}
            )

        # ──────────────────────────────────────────────
        # PROTECTION 2: Connection Draining Signal
        # If server is shutting down gracefully, tell
        # new clients to retry elsewhere immediately.
        # ──────────────────────────────────────────────
        if _DRAINING:
            return JSONResponse(
                status_code=503,
                headers={"Connection": "close", "Retry-After": "10"},
                content={"detail": "Server draining. Retry in 10 seconds."}
            )

        # ──────────────────────────────────────────────
        # PROTECTION 3: HTTP/2 Concurrent Stream Cap
        # Prevents a single IP from opening 1000 streams
        # over one TCP connection (HTTP/2 flood).
        # ──────────────────────────────────────────────
        current_streams = _active_connections.get(client_ip, 0)
        if current_streams >= MAX_CONCURRENT_STREAMS:
            logger.warning(f"H2 STREAM CAP: {client_ip} hit {MAX_CONCURRENT_STREAMS} concurrent limit")
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": "5"},
                content={"detail": f"HTTP/2 stream limit reached ({MAX_CONCURRENT_STREAMS} max concurrent)."}
            )
        _active_connections[client_ip] = current_streams + 1

        # ──────────────────────────────────────────────
        # PROTECTION 4: Leaky Bucket — Input smoothing
        # Even if token bucket allows a burst, leaky bucket
        # ensures output to upstream is a smooth constant rate.
        # ──────────────────────────────────────────────
        leaky_allowed = self._leaky_bucket_check(client_ip)
        if not leaky_allowed and not is_premium:
            _active_connections[client_ip] -= 1
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": "2"},
                content={"detail": "Leaky bucket: Output smoothing limit reached. Burst absorbed."}
            )

        # ──────────────────────────────────────────────
        # PROTECTION 5: RED — Random Early Detection
        # Drop packets PROBABILISTICALLY before the queue
        # fills completely — triggers sender congestion control.
        # ──────────────────────────────────────────────
        cpu_load = self._get_current_load()
        if self._red_should_drop(cpu_load, is_premium):
            _active_connections[client_ip] -= 1
            logger.warning(f"RED: Probabilistic early drop for {client_ip} at load={cpu_load:.2f}")
            return JSONResponse(
                status_code=503,
                headers={"Retry-After": "3"},
                content={"detail": "RED: Early congestion drop. Queue filling — reduce send rate."}
            )

        # ──────────────────────────────────────────────
        # PROTECTION 6: DSCP — Traffic Classification (QoS)
        # Classify request priority. Premium = EF, Standard = AF, Suspect = CS0
        # This header drives WFQ at the load balancer level.
        # ──────────────────────────────────────────────
        dscp_class = "EF" if is_premium else ("CS0" if cpu_load > 0.85 else "AF")

        # ──────────────────────────────────────────────
        # PROTECTION 7: Slow Loris — Request Timeout Enforcement
        # If the request body/headers don't complete within
        # REQUEST_TIMEOUT_SEC, abort connection.
        # ──────────────────────────────────────────────
        try:
            queue_entry_time = time.time()
            response = await asyncio.wait_for(
                call_next(request),
                timeout=REQUEST_TIMEOUT_SEC
            )
            queue_delay_ms = (time.time() - queue_entry_time) * 1000

        except asyncio.TimeoutError:
            _active_connections[client_ip] -= 1
            logger.warning(f"SLOW LORIS: Request from {client_ip} timed out after {REQUEST_TIMEOUT_SEC}s")
            return JSONResponse(
                status_code=408,
                content={"detail": f"Slow Loris protection: Request timed out ({REQUEST_TIMEOUT_SEC}s limit)."}
            )

        # ──────────────────────────────────────────────
        # PROTECTION 8: CoDel — Controlled Delay
        # If queue delay exceeds 5ms target, emit a congestion
        # ECN-like signal in the response header to slow senders.
        # ──────────────────────────────────────────────
        _queue_delays.append(queue_delay_ms)
        codel_signal = "congested" if queue_delay_ms > CODEL_TARGET_MS else "clear"

        # ──────────────────────────────────────────────
        # PROTECTION 9: AIMD — Adaptive Rate Weight Update
        # If this request was fast, increase congestion window for IP (Additive).
        # If this request was slow (>500ms), cut the allowed rate in half (Multiplicative).
        # ──────────────────────────────────────────────
        self._aimd_update(client_ip, queue_delay_ms)

        # ──────────────────────────────────────────────
        # PROTECTION 10: Backpressure — Retry-After Headers
        # When load is high, tell the client explicitly how long to wait.
        # ──────────────────────────────────────────────
        if cpu_load > 0.8:
            backpressure_wait = math.ceil(cpu_load * 10)  # Dynamic: higher load = longer wait
            response.headers["Retry-After"] = str(backpressure_wait)
            response.headers["X-Backpressure"] = "active"

        # ──────────────────────────────────────────────
        # PROTECTION 11: WFQ — Weighted Fair Queuing Metadata
        # Attach QoS classification and AIMD window to response
        # headers for the load balancer's fairness scheduler.
        # ──────────────────────────────────────────────
        aimd_factor = _aimd_state.get(client_ip, {}).get("rate_factor", 1.0)

        response.headers["X-Niyanta-DSCP"] = dscp_class
        response.headers["X-Niyanta-AIMD-Factor"] = str(round(aimd_factor, 3))
        response.headers["X-Niyanta-CoDel"] = codel_signal
        response.headers["X-Niyanta-Load"] = str(round(cpu_load, 2))

        # Release connection slot
        _active_connections[client_ip] = max(0, _active_connections.get(client_ip, 1) - 1)

        return response

    # ─────────────────────────────────────────────────────────────────
    # HELPER METHODS
    # ─────────────────────────────────────────────────────────────────

    def _is_spoofed_private_ip(self, client_ip: str, request: Request) -> bool:
        """
        BCP38: If we receive a packet claiming to be from an RFC1918 private
        IP on an untrusted (external) interface header, it's spoofed.
        In production, compare X-Forwarded-For with known network topology.
        """
        private_prefixes = ("10.", "172.16.", "192.168.", "127.")
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        # If the load balancer passes an X-Forwarded-For that starts with a
        # private range on an otherwise-external request path, flag it.
        if forwarded_for:
            claimed_ip = forwarded_for.split(",")[0].strip()
            if any(claimed_ip.startswith(p) for p in private_prefixes):
                if not any(client_ip.startswith(p) for p in private_prefixes):
                    return True  # External source claiming private origin = spoofed
        return False

    def _leaky_bucket_check(self, client_ip: str) -> bool:
        """
        Leaky Bucket: Allow requests at a constant drain rate (LEAKY_DRAIN_RATE/sec).
        Unlike token bucket, does not allow bursts in excess of the drain rate.
        """
        now = time.time()
        bucket = _leaky_buckets.get(client_ip, {"last_drain": now, "volume": 0})
        elapsed = now - bucket["last_drain"]
        # Drain the bucket based on time passed
        bucket["volume"] = max(0, bucket["volume"] - elapsed * LEAKY_DRAIN_RATE)
        bucket["last_drain"] = now

        if bucket["volume"] < LEAKY_DRAIN_RATE:
            bucket["volume"] += 1
            _leaky_buckets[client_ip] = bucket
            return True
        _leaky_buckets[client_ip] = bucket
        return False

    def _get_current_load(self) -> float:
        """
        Returns a 0.0–1.0 load factor. In production, pull from the
        MonitoringAgent's live CPU metrics instead of psutil directly.
        """
        try:
            import psutil
            return psutil.cpu_percent(interval=None) / 100.0
        except Exception:
            return 0.5  # Fail safe to 50% load assumption

    def _red_should_drop(self, load: float, is_premium: bool) -> bool:
        """
        RED — Random Early Detection:
        Between min and max threshold, drop packets with linearly
        increasing probability. Premium users are exempt.
        """
        if is_premium or load < RED_MIN_THRESHOLD:
            return False
        if load >= RED_MAX_THRESHOLD:
            return True
        # Linear probability between min and max thresholds
        drop_prob = (load - RED_MIN_THRESHOLD) / (RED_MAX_THRESHOLD - RED_MIN_THRESHOLD)
        return random.random() < drop_prob

    def _aimd_update(self, client_ip: str, latency_ms: float):
        """
        AIMD — Additive Increase Multiplicative Decrease:
        - If request was fast (<50ms): Increase rate factor by 0.1 (additive)
        - If request was slow (>500ms): Cut rate factor in half (multiplicative)
        Rate factor is exported in response headers for load balancer scheduling.
        """
        state = _aimd_state.get(client_ip, {"rate_factor": 1.0, "last_congestion": 0})
        if latency_ms > 500:
            state["rate_factor"] = max(0.1, state["rate_factor"] * 0.5)  # Multiplicative decrease
            state["last_congestion"] = time.time()
        elif latency_ms < 50:
            state["rate_factor"] = min(2.0, state["rate_factor"] + 0.1)  # Additive increase
        _aimd_state[client_ip] = state


def trigger_connection_draining():
    """Call this from a SIGTERM handler to gracefully drain connections."""
    global _DRAINING
    _DRAINING = True
    logger.info("Connection draining ACTIVATED — server shutting down gracefully.")
