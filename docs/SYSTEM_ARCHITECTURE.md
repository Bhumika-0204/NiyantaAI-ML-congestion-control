# FAANG-Level System Architecture: Niyanta AI

Niyanta AI is engineered as a highly scalable, distributed, event-driven API Gateway utilizing Reinforcement Learning (Proximal Policy Optimization) and robust asynchronous pipelines.

---

## A. High-Level Architecture

The system operates across a microservices grid decoupled via Kafka and unified through an Async FastAPI Gateway.

```text
                                  +-----------------------+
                                  |    External Clients   |
                                  +-----------+-----------+
                                              | (HTTPS/WSS)
                                              v
                              +-------------------------------+
                              |    Elastic Load Balancer      |
                              +---------------+---------------+
                                              |
      +---------------------------------------+---------------------------------------+
      |                                       |                                       |
      v                                       v                                       v
+------------+                          +------------+                          +------------+
| Niyanta GW |                          | Niyanta GW |                          | Niyanta GW | 
| (FastAPI)  |                          | (FastAPI)  |                          | (FastAPI)  |
+-----+------+                          +-----+------+                          +-----+------+
      |                                       |                                       |
      +---------------+-----------------------+-----------------------+---------------+
                      |                                               |
                      v                                               v
            +-------------------+                           +-------------------+
            |  Redis Cluster    |                           | Kafka Event Bus   |
            | (Rate Limiter via |                           | (Async Streaming) |
            |  Lua Scripts)     |                           +-------------------+
            +-------------------+                                     |
                                                                      v
                     +--------------------------------------------------------+
                     |                 Machine Learning Engine                |
                     |  [PPO RL Model] <---> [ChromaDB / RAG Explainability]  |
                     +--------------------------------------------------------+
```

---

## B. Component Interaction Flow

1. **API Gateway**: Acts as the ingress controller. Validates JWT, routes requests, and offloads heavy metrics to Kafka immediately to ensure thread availability.
2. **Redis Cluster**: Operates purely in-memory. The Gateway executes non-blocking atomic Lua scripts to verify token buckets instantly.
3. **ML Engine**: Operates as a parallel microservice. It pulls asynchronous state streams from Kafka to optimize the PPO Policy, whilst the Gateway uses a cached, low-latency version of the inference model.
4. **Kafka**: The central nervous system. Everything non-critical to request turnaround (logging, anomaly detection, metric aggregation) is pushed to Kafka.
5. **Observability Stack**: Prometheus scrapes the Gateway endpoints. Grafana visualizes the scraped data. OpenTelemetry injects trace IDs at the Gateway to monitor the entire microservices hop.

---

## C. Request Lifecycle (End-to-End Topology)

To achieve `<10ms` overhead, a single request traces the following lifecycle:

1. **Client** initiates `POST /api/data`.
2. **ELB** routes the request to a healthy **Gateway** instance.
3. **Gateway** performs JWT validation directly via symmetric key caching.
4. **Gateway** executes an atomic Lua script on **Redis** passing `[IP, API_KEY]`.
    - *If rejected:* Returns `429 Too Many Requests`.
5. **Gateway** queries the localized **ML Policy Cache** (updated every 5 seconds from the ML Engine) with current system state (CPU, packet rate).
6. **Policy Decision** (Allow/Throttle/Block) is applied.
7. **Gateway** routes the request to the upstream **Backend Service**.
8. **Gateway** receives the upstream response.
9. **Gateway** emits telemetry payload `[latency, throughput, action_taken]` asynchronously to **Kafka** `request_logs` topic.
10. **Dashboard** visualizes this real-time stream via WebSockets pulling aggregated views.

---

## D. Data Flow Pipeline

### 1. Real-Time Inference Flow
- Read-heavy, write-light.
- Inference occurs entirely within the Gateway's memory using a deployed `.ONNX` or localized Python PPO policy matrix to avoid network I/O penalties to the ML Engine during critical path execution.

### 2. Offline ML Training Pipeline
- Write-heavy. 
- The Gateway streams raw metrics into Kafka. 
- A designated Kafka Consumer batch-writes these streams to a Data Lake (e.g., S3 / Parquet). 
- MLflow orchestrates a nightly or threshold-based retraining of the PPO agent, validating rewards (max throughput, min latency) before hot-swapping the new model weights to the Gateway instances.

---

## E. Scaling Design

- **Stateless Services:** The FastAPI Gateway layer is entirely stateless. State is delegated exclusively to Redis and Kafka.
- **Horizontal Scaling:** Handled via Kubernetes HPA (Horizontal Pod Autoscaler). Targeted metric: `CPU Utilization > 70%` triggers pod spinning.
- **Load Balancer:** AWS ALB or NGINX handling Round Robin distributions and TLS termination.

---

## F. Failure Handling Matrix

Given distributed complexities, graceful degradation is essential:

| Failure Scenario    | Detection Mechanism | System Behavior (Graceful Degradation)                            |
| ------------------- | ------------------- | ----------------------------------------------------------------- |
| **Redis Down**      | Socket Timeout      | Trip Circuit Breaker. Drop to **In-Memory Fallback Limiter**.     |
| **ML Engine Fails** | Health Check Fails  | Bypass localized ML Cache. Fallback to **Rule-Based ACLs**.       |
| **Kafka Lag > 1B**  | Offset Monitoring   | Initiate local **Buffer Spilling/Dropping** to prevent OOM crash. |
| **Backend Down**    | 5xx Rate Spike      | Auto-Throttle to protect Gateway resources, serve 503 instantly.  |

---

## G. Trade-Offs Analyzed

* **Redis vs. Local In-Memory Dictionary**: 
  - *Trade-off*: Local memory is faster (~1µs) but fails rapidly in distributed horizontally scaled systems (Rate Limiting race conditions across 10 pods). Redis Lua scripting guarantees atomicity globally at a slight mapped network penalty (~1ms).
* **Kafka vs. Synchronous API Calls for Logs**: 
  - *Trade-off*: Sync calls guarantee delivery but bind thread execution, degrading gateway throughput dramatically under load. Kafka acts as a Fire-and-Forget buffer, sacrificing immediate real-time ML updates for gateway stability.
* **PPO vs. DQN (Reinforcement Learning)**: 
  - *Trade-off*: DQN is simpler but struggles with continuous action spaces (like throttle percentage). PPO is robust, highly stable during parallel training, and handles the continuous nature of network states significantly better.

---

## H. Scale Targets

This architecture is optimized to support:
- **Throughput:** `10K – 100K requests/second` per geographical region.
- **Added Latency (Gateway Overhead):** `< 5ms` at P95 (95th percentile).
- **High Availability:** `99.99%` uptime (4 nines via multi-AZ Kubernetes spanning).
