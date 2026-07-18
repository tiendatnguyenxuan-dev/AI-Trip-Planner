import json
import os
import logging
from typing import List, Dict, Any
from app.infrastructure.repositories.base_history_repository import BaseHistoryRepository

logger = logging.getLogger(__name__)

# Keep a shared in-memory fallback for test environments or rapid access
_in_memory_db: Dict[str, List[Dict[str, Any]]] = {}

class FileHistoryRepository(BaseHistoryRepository):
    """
    File-based persistent implementation of travel history repository.
    Saves and reads history entries to/from a local JSON file.
    """
    def __init__(self, file_path: str = None):
        if file_path is None:
            # Default to a json file in the app directory
            file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "trip_history.json"
            )
        self.file_path = file_path
        self._load_file()

    def _load_file(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    _in_memory_db.clear()
                    _in_memory_db.update(data)
            except Exception as e:
                logger.error(f"Failed to load history file: {e}")

    def _save_file(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(_in_memory_db, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Failed to write history file: {e}")

    def save_history(self, user_id: str, history_entry: Dict[str, Any]) -> None:
        if not user_id:
            return
        if user_id not in _in_memory_db:
            _in_memory_db[user_id] = []
        _in_memory_db[user_id].append(history_entry)
        self._save_file()

    def get_history(self, user_id: str) -> List[Dict[str, Any]]:
        return _in_memory_db.get(user_id, [])
