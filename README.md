# Niyanta AI — ML-Based Network Congestion Controller

> A real-time, full-stack intelligent system that simulates network traffic, predicts congestion using machine learning, and dynamically adjusts packet flow through a closed-loop WebSocket architecture.
> 
---

## 📸 Dashboard Preview
🔹 Live Monitoring Dashboard

(Add screenshot here)

🔹 Static vs Adaptive Comparison

(Add screenshot here)

🔹 ML Node Behavior

(Add screenshot here)

🔹 Terminal Diagnostics (Explainable AI)

(Add screenshot here)

🔹 ML Pipeline Architecture

(Add screenshot here)

## 📌 Overview

  Traditional network systems rely on reactive congestion control, responding only after congestion occurs.

  * Niyanta AI introduces a proactive approach:

  * Uses machine learning to detect early congestion signals and dynamically adjust traffic before packet loss escalates.

  * This project transforms a basic simulation into a real-time engineering system combining:

 ---
  
## 🧠 ML-driven decision making
 ⚡ WebSocket-based real-time streaming
 
 🌐 Full-stack architecture
 
 📊 Live system visualization

 ---
 
## 🚀 Key Features
🔄 Dual Simulation Engine

Runs Static vs ML-Adaptive models simultaneously
Ensures identical input → fair comparison
Clearly demonstrates performance improvements

⚡ Real-Time WebSocket Streaming

Eliminates REST polling
Streams simulation ticks instantly
Provides smooth, low-latency UI updates

🧠 ML-Based Adaptive Control

Logistic Regression + StandardScaler pipeline
Uses predict_proba() with threshold (0.6)
Converts predictions into control actions:
⬇ Decrease rate → avoids congestion
⬆ Increase rate → maximizes throughput

---

##📊 Advanced Dashboard


Live charts:

Throughput

Queue Load

Packet Drops


Key metrics:

📈 Throughput

📉 Packet Loss %

📊 Avg Queue Size


Side-by-side comparison:

Static vs Adaptive

---

## 🖥️ Terminal Diagnostics (Explainable AI)

Real-time logs showing ML decisions:

[t=2] Throttling bandwidth to 18 pkts/s (Risk: 79%)

[t=3] Throttling bandwidth to 16 pkts/s (Risk: 87%)

👉 Provides transparency into system decisions

---

## 💾 Replay System


Export simulation data (JSON)
Reload and replay runs in UI

🧠 ML Integration

🔹 Features Used

incoming_rate

queue_length

sent_packets

dropped_packets

🔹 Output Logic

Instead of binary classification:

High risk → decrease rate (rate - 2)

Low risk → increase rate (rate + 1)

👉 Forms a closed-loop feedback controller

---


## ⚙️ Tech Stack


🔹 Backend

FastAPI

WebSockets

Scikit-learn

Pandas


🔹 Frontend


React + Vite

Tailwind CSS


Recharts


🧬 System Architecture

Simulation → ML Controller → Metrics → WebSocket → Frontend Dashboard

Each user gets an isolated simulation session

No shared state → no data conflicts


Fully concurrent system

▶️ Getting Started

🔹 Phase 1: Setup ML

.venv\Scripts\activate
python simulator/data_collector.py

python ml/train_model.py


🔹 Phase 2: Start Backend


.venv\Scripts\activate
pip install -r backend/requirements.txt

uvicorn backend.main:app --reload


👉 Runs on: 


🔹 Phase 3: Start Frontend


cd frontend

npm install

npm run dev



👉 Open: 



## 📘 Documentation

For detailed system design, architecture, and ML explanation:

👉 **[View Full Documentation](./DOCUMENTATION.md)**
---

##📈 Results

Under high-load simulation:

📉 >30% reduction in packet loss

📈 ~15–20% improvement in throughput

📊 Stable queue vs uncontrolled overflow (static model)

🧠 Engineering Highlights

⚡ Real-time systems (WebSockets)

🧠 ML-based decision control

🌐 Full-stack architecture

🔄 Concurrent simulation design

🖥️ Explainable AI (logs + decisions)

---

##🧩 System-level thinking


🚀 Deployment

Frontend → Vercel

Backend → Render / Railway


👩‍💻 Author

Bhumika Kumari

B.Tech — Computer Science & Engineering



🔹 Focus Areas

* Machine Learning

* Core Computer Science

* Systems Engineering


⭐ Final Note

This project demonstrates how machine learning can move beyond prediction and become an active control system for real-time optimization.
