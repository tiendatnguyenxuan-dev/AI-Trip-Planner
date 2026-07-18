from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.personalization_service import personalization_service

class PersonalizationNode(BaseNode):
    """
    Applies user preferences and history personalization constraints to parsed entities.
    """
    @property
    def name(self) -> str:
        return "PersonalizationNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id and context.parsed_query:
            entities = context.parsed_query.entities
            enhanced_entities, personalized = personalization_service.enhance_entities(entities, context.user_profile)
            context.parsed_query.entities = enhanced_entities
            context.metadata["personalized"] = personalized
