# FAANG System Design Interview Preparation

This document arms you with the exact vernacular, high-level abstractions, and technical depth required to present **Niyanta AI** as a top 1% FAANG project for Senior/Staff roles (20–50 LPA tier).

---

## 1. The 1-Minute Elevator Pitch
"I built Niyanta AI, an enterprise-grade, distributed AI API Gateway designed to autonomously protect upstream microservices from extreme traffic spikes and DDoS attacks. Unlike traditional gateways relying on static rules, my system uses a Proximal Policy Optimization (PPO) Reinforcement Learning agent executing in sub-millisecond memory to dynamically throttle traffic based on real-time hardware telemetry. It incorporates a distributed Redis Lua-backed token bucket to ensure rate limits remain synchronized across a horizontally scaled Kubernetes cluster without race conditions, and it relies heavily on an asynchronous Kafka pipeline to offload heavy monitoring telemetry, ensuring the core networking loop never blocks."

---

## 2. The 3-Minute Architectural Deep Dive
"The core challenge was integrating ML prediction directly into the critical networking path without adding unacceptable latency. 

To solve this, I designed the FastAPI gateway to be entirely asynchronous. When a request hits, it skips the database and validates JWTs cryptographically. Then, it checks rate limits via an atomic Lua script executed on a Redis cluster, converting a multi-call check-and-decrement process into a single network hop, removing race conditions globally.

For the AI logic, I couldn't afford to make network calls to a Python ML microservice per request. Instead, the PyTorch PPO model weights are loaded directly into the gateway's local memory. It processes the CPU and latency matrices instantly and returns an Action—Allow, Throttle, or Block. 

To handle the heavy telemetry required for training that agent, I decoupled the data ingestion. The gateway uses a fire-and-forget publish mechanism to stream over 10,000 events per second to a Kafka broker. A background Spark or Python consumer aggregates those logs to a Data Lake, runs offline RL training epochs nightly, and pushes new optimized weights back out. If Redis fails, or the AI hangs, strict Circuit Breakers drop the system to local memory and rule-based fallbacks to guarantee 100% gateway uptime."

---

## 3. Top 10 Technical Questions & Answers

1. **Why use Redis Lua scripting for the Token Bucket instead of regular `GET/SET`?**
   *Answer:* "A regular `GET` followed by a `SET` introduces a race condition. In a highly scaled cluster, if Pod A and Pod B read the bucket at the exact same millisecond, they both see 1 token remaining and both allow the packet, violating the limit. A Lua script executes atomically inside the Redis engine, locking the key until the script completes, guaranteeing global consistency."

2. **Why use PPO instead of simpler algorithms like DQN?**
   *Answer:* "DQN struggles heavily with continuous action spaces and learning stability. PPO restricts exactly how much the policy can change in a single update (Proximal). Since we are dealing with production traffic, massive policy swings like blocking 100% of traffic suddenly are unacceptable; PPO provides necessary mathematical stability."

3. **How does your Gateway handle synchronous blocking during Logging?**
   *Answer:* "It doesn't. If the gateway thread waited for a database write to log a request, throughput would collapse. I implemented an asynchronous Kafka producer with `acks=0` (or `1`). It drops the packet onto the message bus locally in microseconds and moves to the next user request immediately."

4. **What happens to the Gateway if Kafka goes down?**
   *Answer:* "The primary directive of an API Gateway is request routing, not telemetry. If the Kafka producer times out, we execute an internal buffer shed (dropping logs). We lose observability temporarily, but the gateway remains online."

5. **How did you achieve <10ms overhead for ML inference?**
   *Answer:* "By utilizing local execution. I did not deploy the ML engine as a separate API. The PPO model was deployed as a localized compiled graph (PyTorch JIT/ONNX) running in the very same memory space as the FastAPI worker, dropping network latency entirely."

6. **Explain your API Key Authentication scaling strategy.**
   *Answer:* "A DB lookup per request kills scaling. We traded API Keys for short-lived JWTs. The gateway only needs an environment secret to cryptographically verify if the payload is valid, dropping the auth bottleneck to microseconds."

7. **How does the system mitigate the 'Thundering Herd' problem against Redis?**
   *Answer:* "Using jitter and local caching cascades. But fundamentally, if Redis trips the Circuit Breaker due to extreme timeouts, traffic instantly shifts to internal LRU dictionaries in RAM, avoiding server hammering."

8. **How does Auto-scaling compare cost-wise to your AI Throttling?**
   *Answer:* "AWS charges per EC2 minute. Spinning up 40 nodes to absorb a 10-minute traffic spike is financially wasteful and often too slow. My agent prevents the upstream services from CPU-locking by intelligently prioritizing traffic and issuing 429 limits *before* horizontal scaling is fundamentally required, slashing compute bills by up to 50%."

9. **What is Canary Deployment in your MLOps pipeline?**
   *Answer:* "Before the gateway uses the new night's AI model weight, we duplicate 1% of live traffic via the Load Balancer to a shadow cluster running the new model. The shadow cluster makes predictions but doesn't actually block users; it just logs to Kafka so we can verify precision."

10. **Explain your RAG implementation for DevOps.**
    *Answer:* "When the AI starts heavily throttling traffic, DevOps teams panic. I feed the ML decision logs and SHAP feature importance values into ChromaDB. We use OpenAI to query those vectors so an engineer can ask 'Why did we throttle IP 10.0.0.5?' and the LLM responds in plain English: *'CPU triggered 85% capacity, reducing token refill rates.'*"

---

## 4. FAANG System Design Discussion Points (Driving the Interview)
When mapping this on a whiteboard, **proactively guide the interviewer to these three topics:**
1. **Eventual vs Strong Consistency:** Explain that the telemetry pipeline accepts eventual consistency (Kafka logs taking seconds) to ensure the Request Path maintains lowest latency.
2. **Circuit Breakers:** Draw out your State Machine. Interviewers love engineers who plan for total system collapse.
3. **Decoupled Architecture:** Emphasize that the ML Engine does not touch live traffic. It only runs offline batch training, while the thin Gateway executes the lightweight inference.
