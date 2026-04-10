# Enterprise Kafka Event Pipeline Design

To achieve an asynchronous, non-blocking flow for the Niyanta AI API Gateway, Kafka acts as the central event-driven ingestion point for robust scaling, ML training data acquisition, and anomaly detection.

## 1. Topic Design

The Kafka cluster is structured around highly partitioned topics to ensure massive horizontal scaling and isolated consumer processing.

### `request_logs`
- **Purpose**: Raw telemetry payload from every incoming gateway request.
- **Partitions**: High (e.g., 32+). Partitioned by `client_ip` or `tenant_id` to maintain ordering for specific clients if required.
- **Retention**: 7 days.
- **Payload**:
  ```json
  {
    "timestamp": "2026-04-10T19:30:22.000Z",
    "ip": "192.168.1.100",
    "latency_ms": 4.2,
    "action_taken": "throttle",
    "status": 429
  }
  ```

### `ml_training_stream`
- **Purpose**: Aggregated windowed metrics pushed to offline data lakes for Reinforcement Learning (PPO) offline batch training.
- **Partitions**: Medium (e.g., 16).
- **Retention**: 30 days (before offloaded to cold S3 storage).
- **Payload**:
  ```json
  {
    "window_ts": "2026-04-10T19:30:00.000Z",
    "cpu_avg": 78.5,
    "packet_loss_rate": 0.02,
    "throughput": 12500,
    "reward_calc": 0.85
  }
  ```

### `anomaly_events`
- **Purpose**: Urgent alerts triggered by the async ML Isolation Forest model detailing ongoing DDoS signatures or high-risk traffic.
- **Partitions**: Low (e.g., 4).
- **Retention**: 90 days.
- **Payload**:
  ```json
  {
    "timestamp": "2026-04-10T19:31:05.000Z",
    "ip_range": "10.0.0.0/24",
    "threat_score": 0.98,
    "anomaly_type": "DDoS_Spike"
  }
  ```

---

## 2. Event-Driven Architecture Components

### Producers
- **API Gateway (FastAPI)**: Utilizing `confluent-kafka-python` or `aiokafka`, the gateway acts as the primary producer. 
  - *Fire-and-Forget Mode*: The gateway sets `acks=0` (or `acks=1` for reliability) for publishing to `request_logs` to guarantee `< 1ms` publishing overhead, ensuring the request loop is unimpeded.

### Consumers
- **ML Training Pipeline (Spark / Flink / Python Batch)**: Subscribes to `ml_training_stream`. Runs windowed deduplication and writes raw matrices into a Parquet repository for the RL training environments.
- **Anomaly Detection Service**: A highly sensitive background worker listening to `request_logs`. It runs Isolation Forest algorithms over rolling windows. If a threshold passes, it publishes a threat payload immediately to the `anomaly_events` topic.
- **Action Service**: Listens to `anomaly_events` and connects back to the Redis cluster to preemptively inject IP bans directly into the Gateway's Token Bucket ban-list.

---

## 3. End-to-End Data Flow Execution

```text
[Client Traffic]
       |
       v
+-------------+      Async Publish      +------------------+
| API Gateway | ----------------------> | Kafka Topic      |
| (FastAPI)   |    (request_logs)       | (request_logs)   |
+-------------+                         +------------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
       +-------------------------------+                   +-------------------------------+
       | Consumer Group 1:             |                   | Consumer Group 2:             |
       | Anomaly Detection Service     |                   | ML Data Lake Sink             |
       +-------------------------------+                   +-------------------------------+
                       |                                                   |
                       v                                                   v
           [Detects DDoS Pattern]                        [Aggregates into Parquet / S3]
                       |                                                   |
                       v                                                   v
+-------------+      Async Publish      +------------------+     [Nightly PPO RL Training]
| Publishing  | ----------------------> | Kafka Topic      |                   |
| Service     |    (anomaly_events)     | (anomaly_events) |                   v
+-------------+                         +------------------+     [PPO Policy Weights Pushed 
                       |                                          to live API Gateway]
                       v
       +-------------------------------+
       | Consumer Group 3:             |
       | Gateway Action Engine         |
       | (Triggers Redis IP ban)       |
       +-------------------------------+
```

### Flow Breakdown:
1. **Request Intake**: Traffic hits the Gateway. Gateway allows the request.
2. **Telemetry Dump**: Gateway non-blockingly pushes metrics to Kafka.
3. **Async Processing**: The Anomaly Detection service evaluates the stream decoupled from the user's request.
4. **Resolution**: A spike is detected. The anomaly is published, picked up by the Action Engine, and Redis is updated. The user's next request drops instantly at the Gateway level preventing backend damage.
