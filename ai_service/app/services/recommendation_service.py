import random
from typing import Dict, Any, List
from app.application.repositories.base_place_repository import BasePlaceRepository
from app.infrastructure.repositories.place_repository import PlaceRepository
from app.infrastructure.providers.static_dataset_provider import StaticDatasetProvider

class RecommendationService:
    """
    Compatibility bridge. Operates as a legacy service.
    """
    def __init__(self, repository: BasePlaceRepository = None):
        self.repository = repository or PlaceRepository(providers=[StaticDatasetProvider()])

    def map_budget_to_price_level(self, budget: int) -> str:
        if not budget:
            return "medium"
        if budget < 1500000:
            return "low"
        elif budget <= 3000000:
            return "medium"
        else:
            return "high"

    def get_recommendations(self, destination: str, budget: int, vibe: str) -> Dict[str, List[Dict[str, str]]]:
        # Return mock places from new repository ports
        places = self.repository.search_places("", destination)
        hotels = self.repository.search_hotels(destination)
        
        return {
            "places": [{"name": p.name, "type": p.type} for p in places[:5]],
            "hotels": [{"name": h.name, "price_level": h.price_level or "medium"} for h in hotels[:3]]
        }

recommendation_service = RecommendationService()
