import time
from typing import Dict, Any, Optional

class InMemoryCache:
    """
    Thread-safe baseline in-memory TTL caching abstraction.
    Provides simple key-value storage serving as Redis fallback/baseline.
    """
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        entry = self._store[key]
        if entry["expires_at"] and time.time() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"]

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = 300) -> None:
        expires_at = time.time() + ttl_seconds if ttl_seconds else None
        self._store[key] = {
            "value": value,
            "expires_at": expires_at
        }

    def clear(self) -> None:
        self._store.clear()

memory_cache = InMemoryCache()
