from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ITelemetryCollector(ABC):
    """
    Interface for tracking latency, token usage, LLM costs, and provider performance metrics.
    """
    @abstractmethod
    def record_latency(self, component_name: str, duration_ms: float) -> None:
        pass

    @abstractmethod
    def record_llm_metrics(self, model: str, prompt_tokens: int, completion_tokens: int, cost_usd: float = 0.0) -> None:
        pass

    @abstractmethod
    def get_summary(self) -> Dict[str, Any]:
        pass
