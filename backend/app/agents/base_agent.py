import abc
from typing import Dict, Any

class BaseAgent(abc.ABC):
    def __init__(self, name: str):
        self.name = name

    @abc.abstractmethod
    async def act(self, local_state: Dict[str, Any]) -> Any:
        pass

    @abc.abstractmethod
    async def learn(self, experience: Dict[str, Any]):
        pass
