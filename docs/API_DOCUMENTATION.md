# API Documentation (Initial FAANG Specification)

This document outlines the core interacting endpoints for the **Niyanta AI** API Gateway. All endpoints are heavily optimized for asynchronous execution and designed to interface properly with downstream microservices.

---

## 1. Core Ingress / Policy Enforcement

### `POST /analyze-request`
Acts as the central proxy evaluation point. Before a request hits the upstream targets or ML pipeline, it routes through this endpoint for immediate Redis Lua token checks and cached RL policy inference.

**Headers:**
- `Authorization: Bearer <JWT>`
- `X-Client-IP: <IP Address>`
- `X-API-Key: <Key>` (Optional fallback)

**Request Payload (Example from load balancer metrics):**
```json
{
  "client_ip": "10.0.0.52",
  "request_size_bytes": 1024,
  "endpoint_targeted": "/api/v1/payments"
}
```

**Response (200 OK - Allowed):**
```json
{
  "status": "success",
  "action": "allow",
  "ml_confidence_score": 0.98,
  "rate_limit_remaining": 4900,
  "trace_id": "req_5f2b8a..."
}
```

**Response (429 Too Many Requests - Throttled/Blocked):**
```json
{
  "status": "error",
  "action": "throttle",
  "reason": "AI Policy Enforcement: System CPU > 85%, reducing bandwidth.",
  "retry_after_seconds": 15,
  "trace_id": "req_2x8k9m..."
}
```

---

## 2. Observability & Telemetry

### `GET /metrics`
Exposes system-level operations and business-logic matrices directly to Prometheus. This endpoint uses the `prometheus_client` format and is scraped every 5 seconds.

**Request:** `GET /metrics`

**Response (`text/plain`):**
```text
# HELP niyanta_active_connections Current active gateway sockets
# TYPE niyanta_active_connections gauge
niyanta_active_connections{region="us-east-1"} 1543.0

# HELP niyanta_ml_inference_time_ms Histogram of PPO inference speeds
# TYPE niyanta_ml_inference_time_ms histogram
niyanta_ml_inference_time_ms_bucket{le="1.0"} 5000
niyanta_ml_inference_time_ms_bucket{le="5.0"} 9982

# HELP niyanta_redis_failures_total Total circuit trips for Redis
# TYPE niyanta_redis_failures_total counter
niyanta_redis_failures_total 0.0
```

---

## 3. Infrastructure Health

### `GET /health`
A vital endpoint utilized by the Kubernetes Liveness/Readiness probes and AWS ELB Target Groups. It verifies the availability of both the local FastAPI container and its connected distributed systems (Redis and Kafka).

**Request:** `GET /health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-04-10T19:40:12Z",
  "components": {
    "redis_cluster": "OK",
    "kafka_producer": "OK",
    "ml_engine_cache": "OK (Last Update: 2s ago)"
  }
}
```

**Response (503 Service Unavailable - Integration Failure):**
```json
{
  "status": "degraded",
  "version": "2.0.0",
  "timestamp": "2026-04-10T19:40:15Z",
  "components": {
    "redis_cluster": "FAIL (Circuit Breaker OPEN)",
    "kafka_producer": "OK",
    "ml_engine_cache": "OK"
  },
  "message": "Fallback LRU cache active. Primary rate limiter offline."
}
```
