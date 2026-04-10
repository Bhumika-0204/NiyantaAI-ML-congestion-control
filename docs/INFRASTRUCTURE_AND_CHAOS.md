# Infrastructure, Cost Optimization, and Chaos Engineering

## 1. Cost Optimization Analysis

In standard cloud architectures, responding to traffic spikes relies on **Horizontal Pod Autoscaling (HPA)**. However, scaling up heavily compute-bound API gateways is highly asymmetrical in cost.

### Auto-Scaling vs AI Throttling (Niyanta AI approach)
**Standard Auto-Scaling Model:**
- Traffic spikes 500% over 10 minutes.
- HPA triggers at 70% CPU, requesting 40 new Kubernetes nodes on AWS EC2 (c5.large).
- **Cost:** Auto-scaling reacts slowly (node spin-up takes 1-3 mins), causing dropped packets during the window, followed by aggressive over-provisioning that costs hundreds of dollars per hour.

**Niyanta AI Strategy:**
- Traffic spikes 500%.
- Before CPU hits 70%, the localized **PPO Agent** detects the velocity of the request_rate acceleration.
- The agent outputs `Throttle = 30%` for Standard-Tier API users. Bandwidth is smoothly shaped.
- **Cost Savings:** The gateway effortlessly absorbs the malicious spike without provisioning a single new EC2 instance. We estimate **40-60% cloud compute savings** specifically through aggressive, intelligent edge-throttling over blind horizontal scaling.

---

## 2. Chaos Testing (Simulating Failure)

To prove Niyanta is FAANG-ready, we run weekly Chaos Monkey simulations on the production staging cluster.

### Scenario A: Total Redis Cluster Failure
- **The Attack:** Chaos Monkey hard-kills the Redis StatefulSets.
- **System Behavior:**
  - The FastAPI Gateway encounters a strict 200ms socket timeout.
  - The internal Circuit Breaker catches the timeout and transitions to `OPEN` state.
  - **Recovery Strategy:** Rate Limiting execution swaps instantly to the internal Python RAM LRU Cache. Traffic continues unhindered; however, users temporarily benefit from unshared multi-node token buckets until Redis restarts and the Circuit Breaker tests to `HALF-OPEN` -> `CLOSED`.

### Scenario B: Massive Malicious Traffic Spike (DDoS)
- **The Attack:** A botnet targets the authentication ingress endpoint with 250,000 requests/second.
- **System Behavior:**
  - Token Buckets immediately deplete. Legitimate global API users might experience 429s.
  - The background Anomaly Detection Kafka Consumer (Isolation Forest) flags the specific `/24` subclass IPs responsible within seconds. 
  - **Recovery Strategy:** The Action Service issues a permanent IP-ban directly into the gateway's socket termination list. Malicious traffic is decoupled from ML evaluation, freeing the CPU to serve normal packets again instantly.

### Scenario C: ML Model Collapse (Agent Spin-lock)
- **The Attack:** The loaded PPO PyTorch model fails to converge correctly during a nightly update and starts returning `Block (2)` for 100% of traffic.
- **System Behavior:**
  - OpenTelemetry alerts Prometheus that the `Block` metric increased by 8000% within 4 seconds.
  - **Recovery Strategy:** DevOps hits the MLflow rollback webhook. The Gateway unloads the PyTorch tensors and uses standard rule-based API-key counting until a sanitized model weight file is re-propagated over the bus.
