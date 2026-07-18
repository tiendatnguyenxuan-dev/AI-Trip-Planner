from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.recommendation_service import recommendation_service
from app.models.schemas import RecommendationResponse

class RecommendationNode(BaseNode):
    """
    Retrieves venue, dining, and lodging recommendations matching the trip's metadata
    by calling the RecommendationService boundary.
    """
    @property
    def name(self) -> str:
        return "RecommendationNode"

    async def execute(self, context: TripContext) -> None:
        if not context.parsed_query:
            return
            
        entities = context.parsed_query.entities
        destination = entities.destination
        if not destination:
            context.recommendations = RecommendationResponse(places=[], hotels=[])
            return
            
        rec_data = recommendation_service.get_recommendations(
            destination=destination,
            budget=entities.budget,
            vibe=entities.vibe
        )
        context.recommendations = RecommendationResponse(**rec_data)
