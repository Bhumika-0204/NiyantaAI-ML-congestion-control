import os
import time
import numpy as np
from typing import Dict, Tuple

# PyTorch is optional — server starts in heuristic mode without it
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

import logging
logger = logging.getLogger("PPOAgent")

if TORCH_AVAILABLE:
    class PPONetwork(nn.Module):
        """
        Actor-Critic neural network for the PPO Agent.
        """
        def __init__(self, state_dim: int, action_dim: int):
            super(PPONetwork, self).__init__()
            self.fc1 = nn.Linear(state_dim, 64)
            self.fc2 = nn.Linear(64, 64)
            self.actor_head = nn.Linear(64, action_dim)
            self.critic_head = nn.Linear(64, 1)
            
        def forward(self, state) -> Tuple:
            x = torch.relu(self.fc1(state))
            x = torch.relu(self.fc2(x))
            action_logits = self.actor_head(x)
            state_value = self.critic_head(x)
            return action_logits, state_value


class PPOInferenceAgent:
    """
    Production-ready Inference wrapper for FastAPI.
    Falls back to heuristic logic when PyTorch is not installed.
    """
    def __init__(self, model_path: str = None):
        self.state_dim = 4
        self.action_dim = 3
        self.torch_ready = False

        if TORCH_AVAILABLE:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model = PPONetwork(self.state_dim, self.action_dim).to(self.device)
            if model_path and os.path.exists(model_path):
                self.load_model(model_path)
            self.model.eval()
            self.torch_ready = True
            logger.info("PPO Agent: PyTorch model loaded successfully.")
        else:
            logger.warning("PPO Agent: PyTorch not installed. Using heuristic fallback.")

    def load_model(self, path: str):
        self.model.load_state_dict(torch.load(path, map_location=self.device))

    def preprocess_state(self, telemetry: Dict[str, float]):
        cpu = min(telemetry.get("cpu", 0.0) / 100.0, 1.0)
        latency = min(telemetry.get("latency_ms", 0.0) / 1000.0, 1.0)
        packet_loss = min(telemetry.get("packet_loss", 0.0), 1.0)
        req_rate = min(telemetry.get("request_rate", 0.0) / 10000.0, 1.0)
        
        state = np.array([cpu, latency, packet_loss, req_rate], dtype=np.float32)
        if self.torch_ready:
            return torch.tensor(state).unsqueeze(0).to(self.device)
        return state

    def take_action(self, telemetry: Dict[str, float]) -> str:
        """
        Core Inference Method called by FastAPI Gateway.
        Uses PyTorch if available, otherwise smart heuristic.
        """
        if self.torch_ready:
            with torch.no_grad():
                state_tensor = self.preprocess_state(telemetry)
                action_logits, _ = self.model(state_tensor)
                action_idx = torch.argmax(action_logits, dim=-1).item()
                mapping = {0: "allow", 1: "throttle", 2: "block"}
                return mapping.get(action_idx, "allow")
        
        # Heuristic fallback (no PyTorch)
        cpu = telemetry.get("cpu", 0.0)
        req_rate = telemetry.get("request_rate", 0.0)
        latency = telemetry.get("latency_ms", 0.0)
        
        if cpu > 90 or req_rate > 8000:
            return "block"
        elif cpu > 70 or latency > 500 or req_rate > 5000:
            return "throttle"
        return "allow"

# =======================================================
# TRAINING PIPELINE & REWARD DESIGN (OFFLINE ALGORITHM)
# =======================================================
"""
In the offline ML training pipeline (pulled from Kafka logs), the agent explores 
an environment constructed from historical telemetry.

Reward Function Design:
R(s, a) = (W1 * Throughput) - (W2 * Latency Penalty) - (W3 * Crash_Penalty)

def calculate_reward(throughput: float, latency_ms: float, system_crashed: bool) -> float:
    if system_crashed:
        return -100.0  # Massive penalty for OOM or CPU lockup
        
    reward = (throughput * 0.01)  # Reward pushing high throughput
    
    if latency_ms > 500:
        reward -= (latency_ms * 0.05)  # Penalize high latency SLA breaches
        
    return reward
"""

# Singleton instance to be imported by FastAPI routes
ppo_agent = PPOInferenceAgent()
