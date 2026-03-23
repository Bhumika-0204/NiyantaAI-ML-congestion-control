<h1 align="center">Niyanta AI: Network Congestion Controller</h1>

<p align="center">
  <em>A Professional Full-Stack Engineering System simulating network traffic, predicting congestion via Machine Learning, and dynamically throttling load through a closed-loop WebSocket pipeline.</em>
</p>

---

## 📸 Dashboard Interface
<p align="center">
  <img src="file:///C:/Users/Bhumika%20Kumari/.gemini/antigravity/brain/d8de75f2-89b5-40a7-ac3e-e9917bd9e51b/niyanta_ai_full_dashboard_final_1774264669132.png" alt="Niyanta AI Dashboard UI" width="100%" />
</p>

## 📌 Overview
Traditional networks rely on static congestion control, reacting *after* congestion occurs. This project demonstrates how machine learning proactively controls network traffic to prevent congestion before packet loss hits the threshold.

This repository serves as a **production-ready engineering system**, migrating from a standard terminal script into a highly concurrent web architecture with elite ML engineering.

## 🚀 Key Technical Features
- **Concurrent Dual Simulation Engine**: Executes both Static and ML-Adaptive router models simultaneously on identical network streams for clear A/B comparison.
- **Real-Time Data Streaming**: Replaced REST API polling with persistent **WebSockets** for zero-latency, sub-millisecond tick streaming.
- **Isolated State Management**: Engineered connection-keyed in-memory instances enabling multiple clients to run completely isolated, synchronous simulations.
- **Robust ML Pipeline**: Implementing Stratified Splitting, Scikit-Learn Pipelines with `StandardScaler`, and custom threshold `predict_proba()` routing to aggressively eliminate False Negatives.
- **Time-Series Serialization**: Ability to save and replay simulation data vectors via JSON export logic in the frontend.

## 🧠 ML Integration & Action
The backend imports a trained Logistic Regression pipeline dict (`congestion_model.pkl`).
> The model acts as a native system policy engine evaluating features against a tunable 0.6 probability threshold to output incremental adjustments (e.g. `rate - 2` or `rate + 1`) instead of simple binary switches.

---

## ▶️ Getting Started (Step-by-Step Guide)

To run this complete full-stack project locally, follow these steps exactly:

### Phase 1: Environment & Machine Learning
First, ensure your Python environment is active and the latest dataset/model is built.
```bash
# 1. Activate virtual environment
.venv\Scripts\activate

# 2. Generate the dataset with BOTH classes cleanly distributed
python simulator/data_collector.py

# 3. Train the new ML pipeline model (generates congestion_model.pkl)
python ml/train_model.py
```

### Phase 2: Start the Backend (FastAPI + WebSockets)
Open a terminal and start the backend streaming server.
```bash
# 1. Activate environment
.venv\Scripts\activate

# 2. Install all requirements if you haven't yet
pip install -r backend/requirements.txt

# 3. Start the internal WebSockets API Server
uvicorn backend.main:app --reload
# It will run on: http://127.0.0.1:8000
```

### Phase 3: Start the UI (React + Vite)
Open a **new separate terminal session** and start the UI.
```bash
# 1. Navigate to the fresh frontend directory
cd frontend

# 2. Install Javascript dependencies
npm install

# 3. Spin up the dev dashboard
npm run dev
```
Navigate to the `http://localhost:5173` URL the Vite terminal outputs, configure your Load Profile, and click **Start**!

---

## 📘 Deep System Architecture Documentation
For deep-dive interview questions concerning State Flow, WebSocket Justification, Scalability, Concurrency, and ML Metrics, please see:  
👉 **[DOCUMENTATION.md](./DOCUMENTATION.md)**

---
👩‍💻 **Author**: Bhumika Kumari (B.Tech Computer Science & Engineering)  
*Focus: Machine Learning + Core CSE + Systems Engineering*
