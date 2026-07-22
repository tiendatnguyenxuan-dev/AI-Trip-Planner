import time
import logging
from typing import Dict, Any
from app.domain.interfaces.telemetry_interface import ITelemetryCollector

logger = logging.getLogger(__name__)

class InMemoryTelemetryCollector(ITelemetryCollector):
    """
    In-memory performance telemetry collector for latency metrics, token consumption, and costs.
    """
    def __init__(self):
        self._latencies: Dict[str, list] = {}
        self._llm_calls: list = []

    def record_latency(self, component_name: str, duration_ms: float) -> None:
        if component_name not in self._latencies:
            self._latencies[component_name] = []
        self._latencies[component_name].append(duration_ms)

    def record_llm_metrics(self, model: str, prompt_tokens: int, completion_tokens: int, cost_usd: float = 0.0) -> None:
        self._llm_calls.append({
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "cost_usd": cost_usd,
            "timestamp": time.time()
        })

    def get_summary(self) -> Dict[str, Any]:
        latency_summary = {}
        for comp, vals in self._latencies.items():
            latency_summary[comp] = {
                "avg_ms": round(sum(vals) / len(vals), 2) if vals else 0.0,
                "count": len(vals)
            }

        total_prompt_tokens = sum(c["prompt_tokens"] for c in self._llm_calls)
        total_completion_tokens = sum(c["completion_tokens"] for c in self._llm_calls)
        total_cost = sum(c["cost_usd"] for c in self._llm_calls)

        return {
            "latencies": latency_summary,
            "llm_metrics": {
                "total_calls": len(self._llm_calls),
                "total_prompt_tokens": total_prompt_tokens,
                "total_completion_tokens": total_completion_tokens,
                "total_cost_usd": round(total_cost, 6)
            }
        }
