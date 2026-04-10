# Machine Learning Operations (MLOps) & Data Pipelines

To maintain production stability while autonomously improving the Niyanta AI Gateway, we employ an enterprise-grade MLOps architecture using **MLflow**, **Kafka**, and strict canary methodologies.

---

## 1. Data Pipeline for Reinforcement Learning

Reinforcement Learning (PPO) requires "experiences" (States, Actions, Rewards) to learn. Running continuous live training on an edge Gateway violates strict latency budgets. Instead, we use an **Offline Actor-Critic Training Pipeline**.

### Data Flow `(Logs → Kafka → Dataset)`
1. **Online Ingestion**: The FastAPI Gateway evaluates traffic, returning Actions (Allow/Throttle/Block) and monitoring instantaneous outcomes (Throughput, CPU).
2. **Kafka Streaming**: The Gateway publishes payload telemetry asynchronously to the `ml_training_stream` Kafka topic.
3. **Data Lake Sink**: A Kafka Consumer (e.g., Apache Spark Structured Streaming) ingests these events, deduplicates them into rolling 1-minute windows, and writes them into **S3 / Parquet files**.
4. **Offline Environment Simulation**: During nightly cron jobs, PyTorch consumes the Parquet dataset. The PPO algorithm computes Advantage and updates Actor/Critic network weights based on the historical Rewards (maximizing allowed traffic without breaching CPU SLA limits).

---

## 2. MLflow Model Lifecycle Management

Once the nightly training loop completes, the new PyTorch model requires rigorous versioning and staged promotion before it touches live FAANG-tier traffic.

### The MLflow Registry
- **Experiment Tracking**: Every training run is logged to the MLflow tracking server. We log hyperparameters (Learning Rate, Gamma) and evaluation metrics (Mean Reward, Max Throttle Error).
- **Model Registry Statuses**:
  - `Staging`: The model compiled successfully and passed base unit tests.
  - `Production`: The model is actively deployed to the Gateway cluster.
  - `Archived`: Deprecated model versions.

---

## 3. Deployment Strategy: A/B Testing & Canary Deployments

We absolutely **DO NOT** perform cold roll-outs of new ML models. In distributed networking, a misaligned policy could block 100% of valid traffic (false-positive DDoS ban).

### Canary Deployment (Shadow Mode)
1. **Shadow Traffic Integration**: When a model is promoted to `Staging`, Kubernetes spins up a small cluster of "Shadow Gateways". 
2. The primary Load Balancer duplicates `1%` of live traffic to the Shadow Gateways.
3. The Shadow Gateway records its PPO decisions to Kafka *without* executing the actual throttle or block against the user (non-blocking).
4. Data Scientists cross-reference the Shadow Decisions vs Production Decisions to ensure no aggressive regression occurred.

### A/B Testing (Logistic Regression vs PPO)
In areas where traffic is migrated from the legacy model (Logistic Regression) to the new RL model (PPO):
- The ELB routes `90%` of traffic via the `X-Model-Hash` header to the legacy LR Gateway cluster.
- `10%` of traffic is routed to the new PPO cluster.
- **Grafana** monitors two dedicated dashboards tracking `LR_Latency_Overhead` vs `PPO_Latency_Overhead` to validate the RL overhead is negligible before reaching 100% saturation.

---

## 4. Model Rollback Strategy

If a newly deployed PPO agent malfunctions (e.g., suddenly blocks vast IP swaths or causes CPU spin-locks):
1. **Automated Alerting**: Prometheus detects `niyanta_blocked_requests > 3_Standard_Deviations` and alerts PagerDuty.
2. **Immediate Override**: 
   A DevOps engineer (or automated watcher) triggers an API command:
   ```bash
   curl -X POST /api/v1/ml-ops/rollback \
        -H "Authorization: Bearer <ADMIN-JWT>"
   ```
3. **Graceful Degradation**: 
   - The FastAPI instance unloads the PyTorch tensors from GPU/CPU memory immediately.
   - The Gateway invokes a **Rule-Based Fallback** (e.g., standard Token Bucket without dynamic limit estimation) until the cluster natively pulls the previous `Production` flag from the MLflow registry.
