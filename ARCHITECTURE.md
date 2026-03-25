# Niyanta AI - Architecture & System Design

This document details the engineering paradigms and agent-to-agent architectures handling request evaluation within **Niyanta AI**.

## 🏗️ Core Gateway Pipeline
Instead of a monolithic networking script, the system relies on an application-level FastAPI middleware interceptor. 
1. Every incoming HTTP request touches the `TrafficGatewayMiddleware` before routing to internal code.
2. The Gateway makes an `O(1)` memory cache lookup query against the **Execution Agent** to determine if the specific IP has an existing TTL verdict (Allow, Throttle, or Block).
3. If throttled, the request is run through a strict **Token Bucket Rate Limiter**. If empty, a `429 Too Many Requests` is returned. Else, the request finishes via the `call_next()` hook.

## 📡 Agent Communication Flow
The intelligence suite operates largely out-of-band utilizing Python `asyncio` event loops to prevent GIL locking:
- **Monitoring Agent**: Replaces simulated loop ticks with real `psutil.net_io_counters()` tracking to observe the host machine's actual server load, hardware latency variations, and interface bandwidth drops.
- **Prediction Agent**: Unpacks a persisted `LogisticRegression` memory block (`congestion_model.pkl`). Instead of theoretical inputs, it maps physical host network matrices directly against the trained feature weights, running `predict_proba()` to estimate an exact likelihood index of hardware routing collapse.
- **Anomaly Agent**: Currently configured to catch severe request rate variance spikes mathematically to enforce instant DDoS IP blocking without waiting for the ML inference loop.
- **Reasoning Agent (RAG layer)**: Hooked asynchronously to API decision events. Employs ChromaDB to retrieve system networking policies, then queries a foundational LLM model (OpenAI GPT-4 class) to construct plain-text reasoning summaries visible live on the Frontend React Dashboard.

## 🚀 Scaling Design Patterns
To meet the horizontal scaling demands required of an API gateway:
- **Centralized Persistence**: The currently defined local HashMaps inside `execution_agent.py` and `rate_limiter.py` have abstracted interfaces, designed to be swapped natively with `Redis` sets and Redis Lua execution scripts for multi-pod architectures instantly.
- **Multiprocessing**: Designed specifically to support production environments orchestrating `gunicorn` coupled with `-k uvicorn.workers.UvicornWorker` classes, enabling 10K+ req/s ceilings across clustered vCPUs.

## 🔗 Endpoint Definitions
* `POST /analyze` - ML feature consumption evaluating real-time subsystem state indices and generating risk vectors.
* `POST /explain` - Active execution of the Reasoning Agent RAG/LLM inference.
* `POST /query` - Low-level manual Chroma DB query.
* `GET /metrics` - Raw output of tracked telemetry.
* `WS /ws/stream` - The core WebSocket broadcasting bridge streaming synchronized metrics directly down to connected React Clients natively.
