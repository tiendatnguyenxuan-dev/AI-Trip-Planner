import random
from typing import Dict, Any, List
from app.infrastructure.repositories.base_recommendation_repository import BaseRecommendationRepository
from app.infrastructure.repositories.json_recommendation_repository import JSONRecommendationRepository

class RecommendationService:
    def __init__(self, repository: BaseRecommendationRepository = None):
        self.repository = repository or JSONRecommendationRepository()

    def map_budget_to_price_level(self, budget: int) -> str:
        """Simple mapping of budget to price level."""
        if not budget:
            return "medium" # default
        if budget < 1500000:
            return "low"
        elif budget <= 3000000:
            return "medium"
        else:
            return "high"

    def get_recommendations(self, destination: str, budget: int, vibe: str) -> Dict[str, List[Dict[str, str]]]:
        dest_data = self.repository.get_destination_data(destination)
        if not dest_data:
            return {"places": [], "hotels": []}

        # 1. Filter places by vibe (fallback to all if no exact vibe match or no vibe provided)
        places = dest_data["places"]
        filtered_places = []
        if vibe:
            vibe = vibe.lower()
            filtered_places = [p for p in places if p.get("vibe") == vibe]
        
        # If too few places match the vibe, add some general ones to ensure enough places
        if len(filtered_places) < 3:
            filtered_places.extend([p for p in places if p not in filtered_places])

        # Randomize to not always show the same top places
        random.shuffle(filtered_places)
        top_places = filtered_places[:5] # Max 5 recommendations

        # 2. Filter hotels by budget
        price_level = self.map_budget_to_price_level(budget)
        hotels = dest_data["hotels"]
        filtered_hotels = [h for h in hotels if h.get("price_level") == price_level]
        
        # Fallback if no hotels match the exact price level
        if not filtered_hotels:
            filtered_hotels = hotels
            
        random.shuffle(filtered_hotels)
        top_hotels = filtered_hotels[:3] # Max 3 hotel recommendations
        
        return {
            "places": [{"name": p["name"], "type": p["type"]} for p in top_places],
            "hotels": [{"name": h["name"], "price_level": h["price_level"]} for h in top_hotels]
        }

recommendation_service = RecommendationService()
