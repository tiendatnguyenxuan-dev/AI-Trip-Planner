import logging
from app.models.schemas import TripPlanResponse, RecommendationResponse, ItineraryResponse
from app.shared.context.trip_context import TripContext

logger = logging.getLogger(__name__)

class TripPipeline:
    """
    Orchestration pipeline executing sequential travel planning nodes.
    """
    def __init__(self, nodes=None):
        if nodes is None:
            # Fallback for backward-compatibility with singleton imports
            from app.shared.di import container
            nodes = [
                container.fetch_user_node,
                container.parse_node,
                container.personalization_node,
                container.recommendation_node,
                container.planning_node,
                container.history_node
            ]
        self.nodes = nodes

    async def execute(self, context: TripContext) -> TripPlanResponse:
        logger.info(f"--- Trip Planning Execution Started ---")
        
        for node in self.nodes:
            logger.info(f"Executing node: {node.name}")
            await node.before_execute(context)
            await node.validate(context)
            await node.execute(context)
            await node.after_execute(context)
            
        logger.info(f"--- Trip Planning Execution Completed ---")
        
        # Assemble final response from context
        intent = context.parsed_query.intent if context.parsed_query else "UNKNOWN"
        entities = context.parsed_query.entities if context.parsed_query else None
        recommendations = context.recommendations or RecommendationResponse(places=[], hotels=[])
        itinerary = context.itinerary or ItineraryResponse(days=[])
        personalized = context.metadata.get("personalized", False)
        
        return TripPlanResponse(
            intent=intent,
            entities=entities,
            recommendations=recommendations,
            itinerary=itinerary,
            personalized=personalized
        )

trip_pipeline = TripPipeline()
