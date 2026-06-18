import asyncio
import json
import logging
from app.ml.anomaly_detector import anomaly_detector

logger = logging.getLogger("KafkaAnomalyConsumer")

class KafkaAnomalyConsumer:
    """
    Asynchronous Kafka Consumer for the 'request_logs' topic.
    
    This runs as an independent background microservice (or as a FastAPI startup task).
    It does NOT block the request path — it processes telemetry entirely offline
    and publishes alerts to the 'anomaly_events' topic for the Gateway's IP ban engine.
    
    To use in production:
        pip install aiokafka
        kafka_consumer = KafkaAnomalyConsumer(...)
        await kafka_consumer.start()
    """

    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.input_topic = "request_logs"
        self.output_topic = "anomaly_events"

    async def start(self):
        """
        Starts the consume loop. Designed to run as a background asyncio Task.
        Replace the mock below with real aiokafka AIOKafkaConsumer / AIOKafkaProducer.
        """
        logger.info(f"Kafka Anomaly Consumer starting → subscribed to '{self.input_topic}'")
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        await self._mock_consume_loop()

    async def _mock_consume_loop(self):
        """
        Simulates a Kafka telemetry stream for local testing.
        """
        import random
        while True:
            await asyncio.sleep(2)
            mock_telemetry = {
                "ip": f"10.0.0.{random.randint(1, 255)}",
                "cpu": random.uniform(10, 100),
                "latency_ms": random.uniform(1, 200),
                "packet_loss": random.uniform(0, 0.3),
                "request_rate": random.uniform(100, 30000),
                "payload_bytes": random.uniform(64, 65000),
            }
            result = anomaly_detector.analyze(mock_telemetry)
            if result["is_anomaly"]:
                logger.warning(
                    f"[MockKafka] Anomaly published → anomaly_events: {mock_telemetry['ip']} "
                    f"| Score: {result['anomaly_score']}"
                )

kafka_anomaly_consumer = KafkaAnomalyConsumer()
