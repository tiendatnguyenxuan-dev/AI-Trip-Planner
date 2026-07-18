from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.history_service import history_service
from app.services.user_service import user_service

class HistoryNode(BaseNode):
    """
    Saves the processed trip details into the user's travel history and updates user metrics
    by calling the HistoryService and UserService boundaries.
    """
    @property
    def name(self) -> str:
        return "HistoryNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id and context.parsed_query:
            entities = context.parsed_query.entities
            # Only save history if a valid destination was parsed and planned
            if entities.destination:
                history_service.save_history(user_id, entities)
                user_service.update_profile(user_id)
                context.history = {"saved": True}
