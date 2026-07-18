import logging
from app.models.schemas import TripPlanResponse, RecommendationResponse, ItineraryResponse

logger = logging.getLogger(__name__)

from app.shared.context.trip_context import TripContext

from app.application.nodes.fetch_user_node import FetchUserNode
from app.application.nodes.parse_node import ParseNode
from app.application.nodes.personalization_node import PersonalizationNode
from app.application.nodes.recommendation_node import RecommendationNode
from app.application.nodes.planning_node import PlanningNode
from app.application.nodes.history_node import HistoryNode

class TripPipeline:
    def __init__(self):
        # Register nodes in execution order
        self.nodes = [
            FetchUserNode(),
            ParseNode(),
            PersonalizationNode(),
            RecommendationNode(),
            PlanningNode(),
            HistoryNode()
        ]

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
