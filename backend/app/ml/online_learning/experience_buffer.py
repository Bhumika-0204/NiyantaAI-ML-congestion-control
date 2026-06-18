import random
from collections import deque
from typing import List, Dict, Any

class ReplayBuffer:
    def __init__(self, capacity: int = 100000):
        self.buffer = deque(maxlen=capacity)

    def add(self, state: Dict[str, Any], action: Any, reward: float, next_state: Dict[str, Any], done: bool):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> List[tuple]:
        if len(self.buffer) < batch_size:
            return []
        return random.sample(self.buffer, batch_size)

    def size(self) -> int:
        return len(self.buffer)


global_replay_buffer = ReplayBuffer(capacity=100000)
