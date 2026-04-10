# Fault Tolerance, Security & SLA Architecture

This architectural document defines how the Niyanta AI cluster handles total subsystem outages, categorizes security, and fulfills Service Level Agreements (SLAs) under massive load.

---

## 1. Security Enhancements

### JWT Authentication & Stateless Validations
- Instead of executing database lookups for API Keys during every critical request, API keys are traded at an Auth Service for symmetric **JWTs** with strict 15-minute expirations.
- The Niyanta Gateway verifies the signature using an environment-stored secret. This drops connection validation from `~2ms` (DB call) to `<50µs` (cryptographic check).

### IP Reputation System
- We maintain a **Rolling Ban-list** via our Kafka Anomaly events. Known bad actors are matched against a high-speed Trie structure immediately at the Gateway socket connection level, dropping packets before FastAPI parsing even begins.

---

## 2. SLA Management & Quality of Service (QoS)

Niyanta AI must prioritize critical enterprise traffic over free-tier or bulk usage when system CPU constraints are flagged by the RL Agent.

### Weighted / Tiered Rate Limiting
- **Premium Tier:** Configured with large Token Bucket capacities (`500 req`) and rapid refill rates (`50/sec`).
- **Standard Tier:** Tight capacities (`100 req`) and strict refill rates (`10/sec`).

### Priority Queues Execution
When the PPO agent mandates a `throttle` action (e.g., CPU sits at 90%), the gateway evaluates the incoming Tenant Tier:
- Standard Requests are dropped immediately with `429 Too Many Requests`.
- Premium Requests bypass the global throttle rule entirely, absorbing the remaining hardware overhead to guarantee the SLA.

---

## 3. Resilience & Graceful Degradation Strategy

Distributed bottlenecks (e.g., Network partitions reaching Redis, or ML inference engine hanging) cannot crash the Gateway. Niyanta employs strict **Graceful Fallbacks**.

### The Circuit Breaker Pattern
Instead of repeatedly trying to contact a dead Redis server—which blocks threads and causes cascading pod failures—a State Machine is wrapped around external connections.
- **State CLOSED**: Normal operations. Redis is active.
- **State OPEN**: Redis failed 5 times concurrently. The breaker trips. All subsequent calls bypass the network layer instantly taking `<1ms`.
- **State HALF-OPEN**: After 30 seconds, 1 test packet is sent via Redis to attempt reconnection.

### Failure Routing Matrix
| Subsystem Failure | Immediate Fallback Protocol | Client Impact |
|:---|:---|:---|
| **Redis Cluster Disconnected** | **Local In-Memory Cache** (Bounded LRU dictionary running generic token bucketing until the circuit closes). | None. Rate limits lose global synchronization briefly across nodes, but capacity continues. |
| **ML PPO Agent Timeout / OOM** | **Rule-Based ACL Policy**. Uses predefined, static metric boundaries (e.g., IF CPU > 85%, Block). | Loss of AI intelligence. Throttle accuracy drops, traffic may experience harsher generic limits. |
| **Kafka Event Broker Down** | **Shed Logs**. The gateway executes an internal flush strategy, abandoning logs in memory rather than pausing request execution waiting for an acknowledgement. | Complete loss of Telemetry for dashboards during the window. 100% gateway uptime maintained. |

By prioritizing Request Efficacy over Telemetry Delivery and using strict timeout protocols (e.g., `Timeout=500ms`), Niyanta avoids the cardinal sin of microservices: cascading timeouts.
