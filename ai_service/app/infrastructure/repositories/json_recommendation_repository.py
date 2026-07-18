import json
import os
from typing import Dict, Any, Optional
from app.infrastructure.repositories.base_recommendation_repository import BaseRecommendationRepository

class JSONRecommendationRepository(BaseRecommendationRepository):
    """
    JSON-based implementation of recommendation repository.
    Loads and resolves destination data from a JSON file.
    """
    def __init__(self, json_file_path: str = None):
        if json_file_path is None:
            # Default to original json path under app/services/
            json_file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "services", "vietnam_63_provinces.json"
            )
        self.json_file_path = json_file_path
        self._destinations = {}
        self._load_destinations()

    def _load_destinations(self):
        try:
            with open(self.json_file_path, "r", encoding="utf-8") as f:
                self._destinations = json.load(f)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to load dataset: {e}")
            self._destinations = {}

    def get_destination_data(self, destination: str) -> Optional[Dict[str, Any]]:
        if not destination:
            return None
        dest_title = destination.title()
        return self._destinations.get(dest_title)
