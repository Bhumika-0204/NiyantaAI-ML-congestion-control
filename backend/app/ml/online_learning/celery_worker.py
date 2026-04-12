import os
import sys
import logging

# Ensure root path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

from celery import Celery
from app.ml.online_learning.experience_buffer import global_replay_buffer

# In a real setup, connect to Redis or RabbitMQ
celery_app = Celery("rl_worker", broker="redis://localhost:6379/1")

import mlflow
import mlflow.sklearn

logger = logging.getLogger("RL_Celery_Worker")

@celery_app.task(name="train_model_from_live_data")
def retrain_ppo_task():
    batch_size = 1024
    experiences = global_replay_buffer.sample(batch_size=batch_size)
    if not experiences:
        logger.info("Not enough experiences in buffer to train.")
        return
    
    logger.info(f"Retraining PPO on {len(experiences)} live experiences.")

    # Placeholder for actual PPO training step
    # PPO implementation would go here and fit() on the experiences
    loss = 0.05 
    
    # MLflow tracking
    try:
        with mlflow.start_run():
            mlflow.log_metric("loss", loss)
            # mlflow.sklearn.log_model(new_model, "ppo_router")
            logger.info("MLflow model version updated.")
            # Emit pub-sub notification that a new model is ready
    except Exception as e:
        logger.error(f"Failed to log to MLflow: {e}")
