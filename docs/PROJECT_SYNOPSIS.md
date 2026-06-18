# Niyanta AI — Project Synopsis
## Adaptive API Gateway for Intelligent Traffic Control

---

## Abstract
Modern web applications face increasing challenges such as Distributed Denial-of-Service (DDoS) attacks, unpredictable traffic spikes, and abnormal client behavior. Traditional API gateways rely on static, rule-based mechanisms that fail to adapt to dynamic traffic conditions.

This project proposes **Niyanta AI**, an intelligent API gateway that integrates machine learning-based anomaly detection with traditional traffic control techniques. The system dynamically analyzes incoming HTTP requests and makes real-time decisions (**Allow**, **Throttle**, **Block**) to ensure system stability, security, and optimal performance.

---

## 1. Introduction
API gateways act as intermediaries between clients and backend services. Existing solutions like NGINX and HAProxy provide routing, rate limiting, and load balancing.

However, these traditional systems:
- Use static thresholds
- Cannot detect unknown attack patterns
- Lack adaptive intelligence

This motivates the need for an AI-driven adaptive gateway system.

---

## 2. Problem Statement
Traditional systems struggle with:
- Dynamic traffic patterns
- Zero-day attacks
- High false positives

### Core Problem
Static, rule-based systems cannot adapt to real-time traffic variations, leading to inefficient traffic control and potential system failures.

---

## 3. Research Gap

### Existing Solutions vs. Proposed Work

| Area | Existing Solutions | Core Problem | Research Gap | Proposed Work (Niyanta AI) |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway / Reverse Proxy** | NGINX, HAProxy | Static routing, rule-based filtering | No adaptive intelligence in decision-making | AI-driven gateway with dynamic request control |
| **Rate Limiting** | Token Bucket, Leaky Bucket (widely used in gateways) | Fixed thresholds cause under/over blocking | Lack of adaptive thresholds under dynamic load | ML-based adaptive rate limiting based on traffic patterns |
| **DDoS Detection** | Signature-based IDS, WAFs (e.g., ModSecurity) | Cannot detect zero-day or unknown attacks | Dependence on predefined signatures | Behavior-based anomaly detection (Isolation Forest / ML) |
| **Load Balancing** | Round Robin, Least Connections | Distributes load but ignores malicious patterns | No intelligence in traffic filtering | Combine load balancing with intelligent filtering decisions |
| **Queue Management** | Tail Drop, basic FIFO | Causes congestion collapse and high packet loss | No delay-aware or probabilistic control | RED + CoDel for intelligent congestion handling |
| **Traffic Analysis** | Rule-based monitoring tools | Limited pattern recognition capability | No real-time learning from traffic behavior | Real-time feature extraction + ML inference |
| **Explainability** | Traditional systems lack transparency | No reasoning behind blocking decisions | No interpretable AI in gateways | Explainable AI (e.g., SHAP-based insights) |
| **Automation** | Manual configuration and tuning | High human intervention required | No self-learning or autonomous adaptation | Fully automated, self-learning gateway system |
| **Detection Speed** | Reactive (trigger-based) | Delayed response to evolving attacks | Lack of proactive detection | Near real-time anomaly detection (< seconds) |

<br/>

### Why Existing Systems Avoided These Features (Root Causes)

| Area | Why Existing Solutions Avoided These Features | Underlying Constraints | Implication | What You Do Differently (Niyanta AI) |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway / Reverse Proxy** | Deterministic behavior is preferred over adaptive logic | Gateways must be predictable, low-latency, and easy to debug | Dynamic decisions can cause inconsistent routing and outages | Add bounded, observable ML decisions (guardrails + fallbacks) |
| **Rate Limiting** | Static algorithms are $O(1)$, simple, and proven | Must run at millions of req/s with near-zero overhead | ML adds compute + variability | Use ML to tune thresholds, keep fast path in Redis |
| **DDoS Detection** | Signature/rule systems are auditable and reliable | Security requires low false positives and compliance | Black-box ML is hard to trust in production | Use behavioral ML + conservative policies (block only high-confidence) |
| **Load Balancing** | Focus is distribution, not security | Needs consistent hashing, stability | Mixing security + balancing increases complexity | Keep LB simple; add filtering at gateway layer |
| **Queue Management** | Network stacks rely on simple, well-tested queues | Must be kernel/edge efficient | ML in queues risks latency spikes | Use RED/CoDel (already smart) + ML upstream |
| **Traffic Analysis** | Rule-based tools are lightweight and fast | Real-time ML needs feature pipelines + compute | Cost/latency overhead at scale | Do lightweight feature extraction at gateway |
| **Explainability** | Production systems need clear, deterministic logs | ML explanations add latency and complexity | Hard to debug decisions in real time | Provide post-hoc explanations (async) |
| **Automation** | Operators prefer manual control for critical systems | Risk of self-learning mistakes causing outages | Conservative design avoids autonomous actions | Semi-autonomous: human-tunable + ML-assisted |
| **Detection Speed** | Trigger-based systems are optimized for speed | ML inference can add milliseconds | Any delay affects SLAs | Use fast models (Isolation Forest) + caching |

---

## 4. Proposed Solution
Niyanta AI introduces a comprehensive solution covering:
- **Hybrid System:** Static rules working alongside AI-based control
- **Real-Time Anomaly Detection:** Behavior-based threat flagging
- **Adaptive Decision-Making:** Live traffic shaping and flow control

---

## 5. System Architecture

### Diagram

```
                    +---------------------------+
                    |        Frontend UI        |
                    |     (Monitoring Only)     |
                    +-------------↑-------------+
                                  │ (WebSocket / HTTP)
                   +----------------------------------+
                   |     FastAPI Gateway (Core)       | <--- Client Requests
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |        Feature Extraction        |
                   |   (Rate, IP, Time, Errors)       |
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |         Decision Engine          |
                   | -------------------------------- |
                   |  Static Rules  │    ML Model     |
                   |  (Signature)   │ (Isolation For.)│
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |      Rate Limiter (Redis)        |
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |     Allow / Throttle / Block     |
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |          Backend Server          |
                   +----------------------------------+
                                  │
                                  ▼
                   +----------------------------------+
                   |       Logging & Database         |
                   +----------------------------------+
```

---

## 6. Methodology
The gateway system combines two distinct operation phases:

### Phase 1: Static System
- Rule-based filtering (such as blocklists and signature matches)
- Fixed rate limiting (enforced via Redis token bucket)

### Phase 2: AI-Based System
- Extract features from raw connection streams
- Apply the trained machine learning model
- Make adaptive decisions in real-time

### Workflow
$$\text{Request} \longrightarrow \text{Feature Extraction} \longrightarrow \text{ML Model} \longrightarrow \text{Decision Verdict} \longrightarrow \text{Action (Allow/Throttle/Block)}$$

---

## 7. Feature Engineering
The system extracts key behavioral features dynamically from the traffic streams:
- **Request rate:** The number of requests processed per second.
- **Inter-arrival time:** Temporal gap between consecutive incoming requests.
- **Unique IP count:** The density of unique source addresses.
- **Error rate:** Rate of non-2xx status codes produced by clients.

These features form the baseline profile to differentiate normal usage from anomalous traffic.

---

## 8. Machine Learning Model
- **Model Used:** Isolation Forest
- **Rationale:**
  - Highly effective at isolating anomalous data points rather than building a complex profile of normal data.
  - Operates completely unsupervised, requiring no manually labeled threat dataset.
  - Highly optimized and suitable for sub-millisecond real-time network inference.
- **Output Verdict:**
  - **Normal:** Request is allowed.
  - **Anomaly:** Request is blocked or throttled based on risk levels.

---

## 9. Dataset
- **Dataset Used:** CIC-DDoS2019
- **Core Features Simulated:** Flow duration, packet count, traffic volume.
- **Justification:**
  - Provides realistic attack simulation for botnets, UDP floods, and TCP SYN attacks.
  - Widely accepted and used in academic and industrial network security research.

---

## 10. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | FastAPI (Python) | High-performance, asynchronous web server framework |
| **ML Model** | scikit-learn | Isolation Forest algorithm implementations |
| **Rate Limiting** | Redis | Atomic token buckets via Lua scripts |
| **Frontend** | React (optional) | Real-time observability dashboard |
| **Dataset** | CIC-DDoS2019 | Base network dataset for attack emulation |

---

## 11. AI Implementation
AI is implemented via:
1. **Feature-based input:** Fast metrics preprocessing pipelines.
2. **Real-time ML inference:** Unsupervised anomaly scoring performed at the gateway path.
