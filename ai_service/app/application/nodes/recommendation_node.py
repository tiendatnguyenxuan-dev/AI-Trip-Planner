import random
from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.infrastructure.repositories.base_recommendation_repository import BaseRecommendationRepository
from app.infrastructure.repositories.json_recommendation_repository import JSONRecommendationRepository
from app.models.schemas import RecommendationResponse

class RecommendationNode(BaseNode):
    """
    Retrieves venue, dining, and lodging recommendations matching the trip's metadata
    by querying the recommendation repository directly.
    """
    def __init__(self, repository: BaseRecommendationRepository = None):
        self.repository = repository or JSONRecommendationRepository()

    @property
    def name(self) -> str:
        return "RecommendationNode"

    def _map_budget_to_price_level(self, budget: int) -> str:
        if not budget:
            return "medium"
        if budget < 1500000:
            return "low"
        elif budget <= 3000000:
            return "medium"
        else:
            return "high"

    async def execute(self, context: TripContext) -> None:
        if not context.parsed_query:
            return
            
        entities = context.parsed_query.entities
        destination = entities.destination
        if not destination:
            context.recommendations = RecommendationResponse(places=[], hotels=[])
            return
            
        dest_data = self.repository.get_destination_data(destination)
        if not dest_data:
            context.recommendations = RecommendationResponse(places=[], hotels=[])
            return
            
        # 1. Filter places by vibe
        places = dest_data.get("places", [])
        filtered_places = []
        vibe = entities.vibe
        if vibe:
            vibe_lower = vibe.lower()
            filtered_places = [p for p in places if p.get("vibe") == vibe_lower]
            
        if len(filtered_places) < 3:
            filtered_places.extend([p for p in places if p not in filtered_places])
            
        filtered_places = list(filtered_places)
        random.shuffle(filtered_places)
        top_places = filtered_places[:5]
        
        # 2. Filter hotels by budget
        price_level = self._map_budget_to_price_level(entities.budget)
        hotels = dest_data.get("hotels", [])
        filtered_hotels = [h for h in hotels if h.get("price_level") == price_level]
        if not filtered_hotels:
            filtered_hotels = hotels
            
        filtered_hotels = list(filtered_hotels)
        random.shuffle(filtered_hotels)
        top_hotels = filtered_hotels[:3]
        
        context.recommendations = RecommendationResponse(
            places=[{"name": p["name"], "type": p["type"]} for p in top_places],
            hotels=[{"name": h["name"], "price_level": h["price_level"]} for h in top_hotels]
        )
