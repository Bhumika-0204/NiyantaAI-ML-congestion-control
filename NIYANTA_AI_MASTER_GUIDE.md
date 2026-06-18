# 🌟 Niyanta AI: Master Architecture, Tech Stack & Operational Guide

Welcome to **Niyanta AI**! If you have zero prior experience with complex distributed systems, container orchestration (Kubernetes/Docker), event streams (Kafka), or reinforcement learning (PPO), don't worry. This guide arranges all the pieces in a clear, sequential, and easy-to-understand manual.

---

## 💡 Part 1: The Tech Stack Demystified

Here is a breakdown of every technology used in Niyanta AI and what it actually does:

1. **Docker & Docker Compose (Containerization)**
   * *What it is:* Think of Docker as a "virtual package" that wraps a piece of software (with its code, libraries, and settings) so it runs exactly the same on your computer as it does on a server in the cloud.
   * *In this project:* We use Docker Compose to spin up three containers simultaneously: our Python backend, our Redis cache, and our React frontend.

2. **Kubernetes (K8s) (Orchestration)**
   * *What it is:* While Docker runs individual containers, Kubernetes manages *thousands* of them. It handles scaling (spinning up 10 copies of the gateway if traffic spikes) and self-healing (restarting a container if it crashes).
   * *In this project:* We have files inside `/kubernetes` that define how Niyanta AI would be deployed in a production-grade cloud cluster.

3. **FastAPI (The Web Framework & API Gateway)**
   * *What it is:* A modern, high-performance, asynchronous web framework for building APIs in Python.
   * *In this project:* FastAPI serves as the main ingress point (the Gateway). Every request from clients passes through FastAPI first.

4. **Redis (The High-Speed Memory Cache)**
   * *What it is:* A super-fast database that runs entirely in your computer's RAM. It reads and writes data in less than a millisecond.
   * *In this project:* It powers our **Distributed Token Bucket Rate Limiter** to quickly track how many requests an IP address is sending.

5. **Apache Kafka (The Asynchronous Event Bus)**
   * *What it is:* A heavy-duty messaging system. Instead of waiting for a database to write logs, we send telemetry to Kafka. It buffers and streams messages asynchronously in the background.
   * *In this project:* It lets the gateway send logs without slowing down user requests. A separate worker listens to Kafka to detect DDoS anomalies.

6. **PPO Reinforcement Learning (PyTorch) (The AI Controller)**
   * *What it is:* Proximal Policy Optimization (PPO) is a machine learning algorithm that learns by trial and error. It receives a **reward** for making good decisions (maintaining low latency and high throughput) and a **penalty** for bad ones (letting the system crash).
   * *In this project:* The PPO agent determines whether to "allow", "throttle", or "block" requests based on system load.

7. **Isolation Forest (The DDoS Detector)**
   * *What it is:* An unsupervised machine learning algorithm designed to catch anomalies (outliers) by isolating data points.
   * *In this project:* It flags IPs that are sending weird burst patterns to prevent DDoS attacks.

8. **ChromaDB & OpenAI (Explainability / RAG)**
   * *What it is:* ChromaDB is a database designed for vector embeddings (numbers representing meanings). Retrieval-Augmented Generation (RAG) queries ChromaDB for policy documents and feeds them to OpenAI to generate human-readable reasoning logs.
   * *In this project:* It powers the "Explain" page on the dashboard to tell you in plain English *why* the AI made a certain routing decision.

9. **React (The Frontend)**
   * *What it is:* A popular JavaScript library for building interactive user interfaces.
   * *In this project:* It powers the real-time telemetry dashboard.

---

## 🔗 Part 2: The Request Lifecycle (How It All Connects)

When a client makes a request to Niyanta AI, it flows through the components in this exact order:

```
[ Client Request ]
       │
       ▼
 1. ZeroTrustMiddleware (L7) ──► Validates JWT token & Timestamp signature. Reject invalid requests.
       │
       ▼
 2. NetworkProtectionMiddleware ──► Checks 11 protective algorithms:
       │                             - Slow Loris: Checks timeout.
       │                             - BCP38: Filters spoofed IP addresses.
       │                             - Leaky Bucket: Smooths output rate.
       │                             - RED/CoDel: Drops requests early if CPU load is critical.
       │
       ▼
 3. TrafficGatewayMiddleware ───► Core routing layer:
       │                             - Hits Redis to check token bucket (Rate limit).
       │                             - Runs PPO Agent inference to decide: ALLOW / THROTTLE / BLOCK.
       │
       ▼
 4. Upstream Backend ──────────► If allowed, forwards the request to your database/service.
       │
       ▼
 5. Asynchronous Kafka Log ────► Emits telemetry data offline.
       │
       ▼
 6. React UI (WebSocket) ──────► Broadcasts telemetry updates to your live dashboard.
```

---

## 📁 Part 3: Folder & File Playbook

Here is where all the files live and what they do:

```
├── backend/
│   ├── app/
│   │   ├── main.py              # Entrypoint. Configures middlewares, routers, and startups.
│   │   ├── api/
│   │   │   ├── routes.py        # API Endpoints (e.g. /analyze, /explain, /policies, /health).
│   │   │   ├── websockets.py    # WebSocket routes streaming live metrics to your frontend.
│   │   │   ├── explainability.py# RAG integration endpoint.
│   │   │   └── chaos.py         # Chaos control (simulate Redis outages or ML lag).
│   │   ├── middleware/
│   │   │   ├── gateway.py       # Core Traffic Gateway (Token Bucket + PPO policy executor).
│   │   │   ├── network_protection.py # 11 protective modules (RED, CoDel, Slow Loris).
│   │   │   └── zero_trust.py    # HMAC/JWT and Request Replay validation.
│   │   ├── ml/
│   │   │   ├── ppo_agent.py     # PPO PyTorch model + fallback heuristics.
│   │   │   ├── anomaly_detector.py # Isolation Forest unsupervised DDoS scorer.
│   │   │   └── reward_functions.py # Reward formula (throughput vs. latency penalization).
│   │   │   └── online_learning/
│   │   │       └── experience_buffer.py # Buffer holding state transitions for RL training.
│   │   ├── services/
│   │   │   ├── distributed_limiter.py # Redis Lua Token Bucket & Circuit Breaker.
│   │   │   ├── ecmp_router.py   # Latency-weighted round-robin backend balancer.
│   │   │   ├── kafka_consumer.py# Background consumer analyzing telemetry from Kafka.
│   │   │   ├── llm_service.py   # OpenAI client connection wrapper.
│   │   │   └── rag_service.py   # ChromaDB vector collection retriever.
│   │   └── plugins/             # Extensible plugin system (RED, CoDel implementation hooks).
├── frontend/                    # React dashboard codebase.
│   ├── src/
│   │   ├── App.jsx              # Core React layout.
│   │   └── pages/
│   │       ├── Dashboard.jsx    # Real-time traffic, latency, and status charts.
│   │       ├── Policies.jsx     # Interactively edit rate-limits and safety flags.
│   │       ├── Security.jsx     # Logs of blocked IPs and spoofing attempts.
│   │       └── AiInsights.jsx   # AI explanation center (RAG output view).
├── simulator/                   # Local benchmarking and attack simulation engines.
│   ├── core/
│   │   ├── engine.py            # Simulation runner (DDoS, Slow Loris generators).
│   │   └── benchmarking.py      # Markdown report compiler.
│   └── profiles/
│       └── ddos.yaml            # YAML definition of simulated attack volumes.
├── kubernetes/                  # Kubernetes configuration files (HPA, node hardening).
```

---

## 🛠️ Part 4: Step-by-Step Command Playbook

To launch, test, and run the entire system on your local machine, execute these commands in order:

### Step 1: Clone and Configure Environment
Copy the configuration template.
```powershell
# In your terminal workspace:
copy .env.example .env
```
*(Open the `.env` file and populate your `OPENAI_API_KEY` if you want AI-generated explanations to work).*

### Step 2: Start the System (FastAPI, Redis, React)
Run Docker Compose to build and start the database, gateway, and dashboard containers simultaneously:
```powershell
docker-compose up -d --build
```
*   **API Documentation (Swagger UI):** `http://localhost:8000/docs`
*   **React Dashboard UI:** `http://localhost:5173`

### Step 3: Run the Benchmarking Traffic Simulator
Simulate standard production traffic to see metrics populate:
```powershell
cd benchmarking
pip install locust
locust -f locustfile.py --host=http://localhost:8000
```
Open `http://localhost:8089` in your web browser, set the number of users to `50` and start swarming.

### Step 4: Simulate a DDoS Attack
Open another terminal pane to run our custom attack simulation engine against the gateway:
```powershell
# Run the DDoS simulator profile
python simulator/core/engine.py simulator/profiles/ddos.yaml http://localhost:8000/api/v1/analyze
```
Look at your React Dashboard or your backend logs. You will see the **Isolation Forest** detect anomalies and request blocks kick in!

### Step 5: Inject Chaos (Fault Tolerance Check)
Test our backend's resilience by simulating database downtime.
```powershell
# Trigger simulated Redis failure via the Chaos API
curl -X POST "http://localhost:8000/api/v1/chaos/toggle_redis?fail=true"
```
*   **Expected Behavior:** The backend logs a Redis outage warning, immediately trips the **Circuit Breaker**, and falls back to our local **In-Memory Token Bucket**. Rates continue limiting smoothly without dropping client requests!

---

## 🛡️ Part 5: Graceful Degradation & Resilience Matrix

One of the key things that makes this system FAANG-grade is that it **cannot fail**. If a component dies, the system degrades gracefully:

1. **What if Redis goes down?**
   * The `CircuitBreaker` trips from `CLOSED` to `OPEN`.
   * The system bypasses Redis and falls back to a local, in-memory rate-limiter dict stored in python.
   * Client requests are still processed. Once Redis is healthy, the breaker returns to `CLOSED` automatically.

2. **What if Kafka goes down?**
   * The logging functions drop back to standard asynchronous mock pipelines or local logging handlers.
   * The request loop is **never blocked** by network delays from Kafka.

3. **What if the ML model / PyTorch is not loaded?**
   * The PPO agent checks `self.torch_ready`. If false, it falls back to a set of robust static threshold policies (e.g. CPU > 90% drops requests), ensuring zero server downtime.
