# Enterprise Observability & Configuration Management

Monitoring millions of packets per second requires absolute distributed transparency. Niyanta AI incorporates a world-class Observability stack alongside dynamic, zero-downtime configuration management.

---

## 1. Metrics & Dashboards (Prometheus + Grafana)

The Gateway completely avoids writing synchronous standard-out logs (which bottleneck I/O async loops on high load). Instead, it publishes raw metrics.

### Prometheus Metric Targets
1. **Request Rates & Errors**: `niyanta_http_requests_total{status="200/429/5xx", client_tier="premium/standard"}`
2. **PPO Action Distribution**: `niyanta_ml_actions_total{decision="allow/throttle/block"}`
3. **Subsystem Latencies**: `niyanta_latency_bucket{service="redis_lua / ml_inference / upstream"}`

### Grafana Visualization Focus
The primary Niyanta Operational Dashboard includes:
- **Red Line AI Thresholds**: A split view showing Upstream API Error Rates versus Gateway PPO `Throttle` actions.
- **Circuit Breaker Heatmap**: A live matrix indicating the state (CLOSED/OPEN) of our connections to Redis and Kafka across the global Kubernetes pods.

---

## 2. Distributed Tracing (OpenTelemetry + Jaeger)

To debug `<10ms` overhead latency spikes across an asynchronous Python service, we instrument **OpenTelemetry**.

### Tracing Pipeline Flow
1. **Ingress**: A client request hits the Gateway. OpenTelemetry generates a unique `TraceID` (e.g., `8d1f02k...`).
2. **Spans**:
   - `[Span A: Gateway Auth Check]`: 0.05ms
   - `[Span B: Redis Token Lua Run]`: 1.2ms
   - `[Span C: PPO ML Inference]`: 0.8ms
   - `[Span D: Upstream Backend Processing]`: 42ms
3. **Jaeger Visualization**: Jaeger collects these spans over UDP cleanly allowing engineering to visualize exactly *why* a particular request took 50ms rather than 5ms. 
4. **Context Propagation**: The `TraceID` is forwarded identically in our Kafka `request_logs` payloads, merging logging workflows with trace views perfectly.

---

## 3. Zero-Downtime Configuration (Consul / etcd)

To maintain true stateless high availability, Niyanta AI pods strictly decouple environmental configurations.

### The Problem
If DevOps needs to forcefully alter the RL risk threshold or change the Redis connection IP, restarting 50 Kubernetes pods drops thousands of live sockets and introduces latency blips.

### The Consul Solution
1. Configuration values (e.g., `PPO_RISK_THRESHOLD`, `GLOBAL_RATE_LIMITER_CAPACITY`, `CIRCUIT_BREAKER_TIMEOUT_MS`) are housed in a centralized **HashiCorp Consul** or **etcd** cluster.
2. The FastAPI pods run a background asynchronous listener matching a Consul watch process.
3. **Dynamic Updates**: When the variable is updated in Consul, the Gateway memory updates the local class variables atomically within milliseconds. 
4. **Result**: The system routing and internal AI SLAs are shifted globally across the entire infrastructure *without a single container restart* or dropped packet.
