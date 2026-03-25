<div align="center">

# 🌐 Niyanta AI
### Autonomous Traffic Intelligence & Agentic Control Platform

[![Live Demo](https://img.shields.io/badge/Live_Deployment-Available_Here-success?style=for-the-badge&logo=vercel)](https://niyanta-ai-ml-congestion-control-three.vercel.app)
[![Python Version](https://img.shields.io/badge/Python-3.11+-blue.svg?style=for-the-badge&logo=python)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()

*An enterprise-grade, application-layer routing gateway powered by Machine Learning, Agentic architectures, and RAG.*
</div>

---

## ⚡ Overview
**Niyanta AI** is a production-ready, highly decoupled autonomous network intelligence system. It acts as an **intercepting API Gateway** that monitors literal hardware network interfaces to dynamically block, throttle, or allow traffic based on predictive Machine Learning models.

Instead of hardcoded rules, Niyanta AI leverages multiple asynchronous **Agents**:
* **Monitoring Agent:** Subscribes to OS-level `psutil` network interfaces to calculate live incoming bandwidth and packet dropout latency.
* **Prediction Agent:** Utilizes Logistic Regression to evaluate microsecond telemetry and predict queuing saturation *before* it crashes the backend.
* **Policy & Execution Agents:** Runs a thread-safe strict Token Bucket ratelimiter connected to a high-speed TTL decision cache.
* **Reasoning Agent (RAG + LLM):** Connects to a robust local `ChromaDB` vector store to retrieve networking logic documents. Feeds context to an OpenAI LLM to generate **human-readable diagnostic explanations** for why a specific packet route was blocked or throttled.

---

## 🔗 Live Production Links
The system is actively deployed under a distributed microservice architecture across Render and Vercel.

* **Live Interactive Dashboard:** [Niyanta AI Mission Control](https://niyanta-ai-ml-congestion-control-three.vercel.app)
* **Backend API Host:** [Niyanta API Gateway (Render)](https://niyantaai-ml-congestion-control-b758.onrender.com)
* **Interactive API Swagger Docs:** [API Documentation](https://niyantaai-ml-congestion-control-b758.onrender.com/docs)

---

## 💻 Tech Stack
* **Frontend:** React 18, Vite, TailwindCSS, Recharts, Lucide Icons, WebSockets
* **Backend:** Python 3.11, FastAPI, Uvicorn, Asynchronous Event Loops
* **AI/ML Layer:** Scikit-Learn (Logistic Regression), ChromaDB (Vector Search), OpenAI API
* **State Management:** Thread-safe Token Bucket implementations, LRU TTL execution cache

---

## 🚀 Quickstart (Local Infrastructure)
You can boot the entire analytical environment locally using Docker Compose.

```bash
# 1. Clone the repository
git clone https://github.com/Bhumika-0204/NiyantaAI-ML-congestion-control.git
cd NiyantaAI-ML-congestion-control

# 2. Inject your LLM Key for the Reasoning Agent
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Boot the Docker containers
docker-compose up --build
```
> The React UI will be available at `http://localhost:5173`.
> The API Gateway will be listening at `http://localhost:8000`.

---

## 📚 Deep Dive Documentation
For advanced details on how the Agentic event loop and RAG integrations actually work, please refer to the [ARCHITECTURE.md](ARCHITECTURE.md).
