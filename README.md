<div align="center">

# 🌐 Niyanta AI
### Autonomous Traffic Intelligence & Control Platform

[![Live Demo](https://img.shields.io/badge/Live_Deployment-Responsive_Dashboard-success?style=for-the-badge&logo=vercel)](https://niyanta-ai-ml-congestion-control-three.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20Python-blue?style=for-the-badge)]()

*A production-grade, application-layer traffic control gateway powered by Machine Learning and Agentic RAG.*

</div>

---

## 🚀 Live Production Links
> **Note:** The old deployment URL was invalidated when the repository was transitioned. Please use the active production link below!

* **Live Interactive Dashboard:** [https://niyanta-ai-ml-congestion-control-three.vercel.app](https://niyanta-ai-ml-congestion-control-three.vercel.app)
* **Backend API Host:** [https://niyantaai-ml-congestion-control-b758.onrender.com](https://niyantaai-ml-congestion-control-b758.onrender.com)

---

## 📖 System Overview
Niyanta AI is a distributed, agentic artificial intelligence platform designed for infrastructure security and traffic intelligence. Unlike standard CRUD applications, Niyanta AI acts as an **intercepting API Gateway**. It actively monitors live hardware-level network telemetry (`psutil`), executes a Machine Learning prediction loop for congestion analysis, and automatically routes or rate-limits network requests before they saturate backend compute instances.

### 🧠 Core Agentic Subsystems
1. **Execution Agent & Gateway:** Implements a strict, thread-safe Token Bucket rate limiter to intercept active HTTP requests, verifying against a high-speed TTL decision cache.
2. **Monitoring Agent:** Hooks directly to the host operating system's exact byte and packet pipelines to gather true hardware usage, rather than simulated data.
3. **Prediction Engine (ML):** Evaluates live telemetry down to the millisecond using Logistic Regression to predict dynamic queue saturation.
4. **Reasoning Agent (RAG + LLM):** If anomalous packets are detected, the system retrieves architectural networking rules from a local ChromaDB vector store and feeds them to an LLM to dynamically explain *why* the policy action was taken.

---

## 💻 Tech Stack
* **Frontend:** React 18, Vite, TailwindCSS, Recharts, Lucide Icons
* **Backend:** Python 3.11, FastAPI, Uvicorn (Asynchronous Event Loop)
* **State Management:** In-memory LRU caching (Designed for Redis failover)
* **AI/ML Layer:** Scikit-Learn (Logistic Regression), ChromaDB (Vector Search), OpenAI LLM

---

## 🐳 Quickstart (Local Docker)
Run the entire ML infrastructure natively on your local machine using Docker Compose.

```bash
# 1. Clone the repository
git clone https://github.com/Bhumika-0204/NiyantaAI-ML-congestion-control.git
cd NiyantaAI-ML-congestion-control

# 2. Inject your LLM Key for the Reasoning Agent
# Open .env.example, rename to .env, and add your OPENAI_API_KEY

# 3. Boot the environment
docker-compose up --build
```
* **Frontend UI:** `http://localhost:5173`
* **API Swagger Docs:** `http://localhost:8000/docs`

---

## 🛠️ Architecture Decisions & Scaling Limits
While highly scalable, the current iteration of the Execution Agent uses server-local memory. For extreme horizontal scaling (>10,000 req/s), the state cache and Token Bucket rate limiter must be transitioned to a distributed `Redis` cluster utilizing embedded Lua scripts to secure the atomicity of token deductions. 

The Reasoning Agent runs highly asynchronously to ensure querying the massive LLM neural network does not block the primary eventloop traffic queue.
