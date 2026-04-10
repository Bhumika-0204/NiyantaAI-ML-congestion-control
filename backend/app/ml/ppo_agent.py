import os
import time
import numpy as np
import torch
import torch.nn as nn
from typing import Dict, Tuple

# In a production FAANG environment, we would typically wrap this in Stable-Baselines3 
# or Ray RLlib. For inference speed on FastAPI, we export directly to a PyTorch JIT 
# compiled module or ONNX for sub-millisecond execution.

class PPONetwork(nn.Module):
    """
    Actor-Critic neural network for the PPO Agent.
    """
    def __init__(self, state_dim: int, action_dim: int):
        super(PPONetwork, self).__init__()
        # Shared feature extractor
        self.fc1 = nn.Linear(state_dim, 64)
        self.fc2 = nn.Linear(64, 64)
        
        # Actor Head: Outputs discrete logprob choices (Allow, Throttle, Block)
        # In a more complex version, this could output continuous values for throttle %.
        self.actor_head = nn.Linear(64, action_dim)
        
        # Critic Head: Value estimation for advantage calculation
        self.critic_head = nn.Linear(64, 1)
        
    def forward(self, state: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        x = torch.relu(self.fc1(state))
        x = torch.relu(self.fc2(x))
        
        action_logits = self.actor_head(x)
        state_value = self.critic_head(x)
        
        return action_logits, state_value

class PPOInferenceAgent:
    """
    Production-ready Inference wrapper for FastAPI.
    Loads the MLflow versioned PyTorch model and provides < 1ms synchronous predictions.
    """
    def __init__(self, model_path: str = None):
        # 1. State Definition
        # Indices: [0: CPU_Utilization, 1: Latency_ms, 2: Packet_Loss_Rate, 3: Request_Rate]
        self.state_dim = 4
        
        # 2. Action Definition
        # 0: Allow, 1: Throttle (e.g., cut bandwidth 50%), 2: Block
        self.action_dim = 3
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = PPONetwork(self.state_dim, self.action_dim).to(self.device)
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
            
        self.model.eval() # Set to evaluation mode for inference

    def load_model(self, path: str):
        """Loads state dict safely, ideal for polling an MLflow artifact registry."""
        self.model.load_state_dict(torch.load(path, map_location=self.device))

    def preprocess_state(self, telemetry: Dict[str, float]) -> torch.Tensor:
        """
        Normalizes telemetry inputs using rolling Z-Score normalization.
        For demonstration, assuming max clipping values.
        """
        cpu = min(telemetry.get("cpu", 0.0) / 100.0, 1.0)
        latency = min(telemetry.get("latency_ms", 0.0) / 1000.0, 1.0)
        packet_loss = min(telemetry.get("packet_loss", 0.0), 1.0)
        req_rate = min(telemetry.get("request_rate", 0.0) / 10000.0, 1.0)
        
        state = np.array([cpu, latency, packet_loss, req_rate], dtype=np.float32)
        return torch.tensor(state).unsqueeze(0).to(self.device)

    @torch.no_grad()
    def take_action(self, telemetry: Dict[str, float]) -> str:
        """
        Core Inference Method called by FastAPI Gateway.
        """
        state_tensor = self.preprocess_state(telemetry)
        
        # Execute network
        action_logits, _ = self.model(state_tensor)
        
        # Deterministic inference (argmax) for production vs stochastic (sampling) in training
        action_idx = torch.argmax(action_logits, dim=-1).item()
        
        mapping = {0: "allow", 1: "throttle", 2: "block"}
        return mapping.get(action_idx, "allow")

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
