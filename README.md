# Niyanta AI 

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**Niyanta AI** is an enterprise-grade, distributed AI-powered API Gateway. It protects upstream backend services from congestion, DDoS spikes, and erratic traffic through the real-time application of **Reinforcement Learning (PPO)**, **Redis-backed distributed Token Bucket rate limiting**, and **15 computer networking protection mechanisms** implemented directly at the application gateway layer.

---

## 🧠 AI & Machine Learning

| Component | Technology | Purpose |
|:---|:---|:---|
| Congestion Prediction | PPO Reinforcement Learning (PyTorch) | Dynamic allow/throttle/block decisions |
| DDoS Detection | Isolation Forest (Scikit-Learn) | Unsupervised anomaly scoring |
| Explainability | ChromaDB + OpenAI RAG + SHAP | Human-readable audit logs |
| Model Lifecycle | MLflow | Versioning, canary deploy, rollback |

---

## 🛡️ Computer Networking Protection Stack (15 Mechanisms)

### Layer 7 — Application Layer
| # | Mechanism | Description |
|:--|:---|:---|
| 1 | **Slow Loris Prevention** | Abort connections that don't complete headers within 30s. Prevents thread exhaustion from slow HTTP attacks. |
| 2 | **AIMD Adaptive Throttle** | Additive Increase Multiplicative Decrease. Halves rate allocation when latency > 500ms, grows it additively when fast. |
| 3 | **Backpressure Propagation** | Sends `Retry-After` headers dynamically scaled to CPU load. Instructs clients to self-throttle before hammering. |
| 4 | **HTTP/2 Stream Concurrency Cap** | Limits each IP to 100 concurrent HTTP/2 streams to prevent multiplexing-based flood attacks. |
| 5 | **Connection Draining Signal** | On SIGTERM, sets a drain flag returning `503 + Retry-After` for new connections while completing existing ones. |

### Layer 4 — Transport / Queue Management
| # | Mechanism | Description |
|:--|:---|:---|
| 6 | **RED (Random Early Detection)** | Probabilistically drops packets as queue load rises between 50–85% CPU, triggering sender-side congestion control before queue overflow. |
| 7 | **CoDel (Controlled Delay)** | Measures per-request queue sojourn time. Emits `X-Niyanta-CoDel: congested` header when delay > 5ms (Google standard). Prevents bufferbloat. |
| 8 | **Leaky Bucket Smoothing** | Maintains a constant output drain rate to the upstream service regardless of token bucket burst allowance. Absorbs thundering herds. |
| 9 | **ECN (Explicit Congestion Notification)** | CoDel delay signal acts as an application-layer ECN equivalent — notifying senders of congestion without packet loss. |

### Layer 3 — Network Layer
| # | Mechanism | Description |
|:--|:---|:---|
| 10 | **BCP38 Ingress Filtering** | Detects and drops packets where `X-Forwarded-For` claims an RFC1918 private IP from an external public interface — eliminates IP spoofing attacks. |

### Quality of Service (QoS)
| # | Mechanism | Description |
|:--|:---|:---|
| 11 | **DSCP Traffic Classification** | Marks requests with Differentiated Services Code Points: Premium → `EF`, Standard → `AF`, Suspect → `CS0`. Drives LB scheduling. |
| 12 | **Weighted Fair Queuing (WFQ)** | Premium API keys bypass RED drops and leaky bucket limits. Standard clients share remaining bandwidth fairly. |

### Infrastructure / Routing (Architectural)
| # | Mechanism | Description |
|:--|:---|:---|
| 13 | **ECMP Routing** | Application-level latency-weighted round-robin (`ecmp_router.py`) + Kubernetes topology spread constraints (`ecmp-service.yaml`). |
| 14 | **Anycast IP Strategy** | Multi-region K8s clusters share a single BGP-advertised VIP via ConfigMap — DDoS is geographically diluted. |
| 15 | **TCP SYN Cookie + ECN** | Kernel-level protection via `node-hardening-daemonset.yaml` — runs `sysctl` on every K8s node automatically. |

---

## 🏗️ Architecture Summary

```
[Client] → [ELB/Anycast] → [NetworkProtectionMiddleware] → [TrafficGatewayMiddleware]
               ↓                       ↓                              ↓
         BCP38 Filter           RED · CoDel · Leaky           Redis Lua Token Bucket
         Anycast Routing        Bucket · AIMD · WFQ            PPO RL Inference
         ECMP Load Split        Slow Loris · H2 Cap            Anomaly Detection
                                                                Kafka Telemetry Stream
```

---

## 💻 Full Tech Stack

### Core System
- **Framework**: `FastAPI` (Python 3.10+, fully async)
- **State Store**: `Redis` Cluster + atomic Lua scripts
- **Event Streaming**: `Apache Kafka`

### Machine Learning
- **RL Agent**: `PyTorch PPO`
- **Anomaly Detection**: `Scikit-Learn Isolation Forest`
- **Explainability**: `ChromaDB`, `OpenAI`, `SHAP`
- **MLOps**: `MLflow`

### DevOps & Cloud
- **Containerization**: `Docker` & `Kubernetes`
- **CI/CD**: `GitHub Actions`
- **Observability**: `Prometheus`, `Grafana`, `OpenTelemetry`, `Jaeger`

---

## ✨ Key Differentiators vs Traditional NGINX Gateways

| Feature | NGINX | Niyanta AI |
|:---|:---|:---|
| Rate Limiting | Static thresholds | ML-adaptive (PPO + hardware aware) |
| DDoS Response | Manual rules | Automated Isolation Forest (< 5s) |
| Congestion Queue | Tail-drop | RED + CoDel (probabilistic, delay-aware) |
| Flow Control | Burst allowed | Leaky Bucket smooth output |
| Explainability | None | RAG + SHAP for every decision |
| Multi-node Sync | None | Redis Lua atomic (race-condition-free) |

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Valid `OPENAI_API_KEY`

### 2. Environment Configuration
```bash
git clone https://github.com/Bhumika-0204/NiyantaAI-Autonomous-Traffic-Intelligence-Platform.git
cd NiyantaAI-Autonomous-Traffic-Intelligence-Platform
cp .env.example .env
# Edit .env with your keys
```

### 3. Spin Up Cluster
```bash
docker-compose up -d --build
```

### 4. Access
- **API Gateway**: `http://localhost:8000/docs`
- **React Dashboard**: `http://localhost:5173`
- **Benchmarking**: `cd benchmarking && locust -f locustfile.py --host=http://localhost:8000`

---

## 📁 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── middleware/
│   │   │   ├── gateway.py              # Token bucket + ML policy middleware
│   │   │   └── network_protection.py   # 11 CN protection mechanisms (code)
│   │   ├── ml/
│   │   │   ├── ppo_agent.py            # PPO Reinforcement Learning
│   │   │   └── anomaly_detector.py     # Isolation Forest DDoS detection
│   │   ├── services/
│   │   │   ├── distributed_limiter.py  # Redis Lua token bucket + Circuit Breaker
│   │   │   ├── kafka_consumer.py       # Async Kafka anomaly pipeline
│   │   │   └── ecmp_router.py          # ECMP latency-weighted load balancer
│   │   └── api/routes.py              # FastAPI endpoints
├── frontend/                           # React Real-Time Dashboard
├── kubernetes/
│   ├── gateway-deployment.yaml         # K8s HPA (3→50 pods)
│   ├── ecmp-service.yaml               # ECMP LB + Anycast + Topology Spread
│   └── node-hardening-daemonset.yaml   # SYN Cookie + ECN + BCP38 kernel tuning
├── benchmarking/locustfile.py          # Load testing suite
├── .github/workflows/ci_cd.yaml       # Full CI/CD pipeline
├── docs/                               # Enterprise documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── KAFKA_PIPELINE_DESIGN.md
│   ├── MLOPS_PIPELINE.md
│   ├── RESILIENCE_AND_SECURITY.md
│   ├── OBSERVABILITY_AND_TRACING.md
│   └── INFRASTRUCTURE_AND_CHAOS.md
├── FAANG_INTERVIEW_PREP.md
└── INTERVIEW_PITCH.md
```
