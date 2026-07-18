from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext

class HistoryNode(BaseNode):
    """
    Saves the processed trip details into the user's travel history and updates user metrics.
    """
    def __init__(self, history_service, user_service):
        self.history_service = history_service
        self.user_service = user_service

    @property
    def name(self) -> str:
        return "HistoryNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id and context.parsed_query:
            entities = context.parsed_query.entities
            # Only save history if a valid destination was parsed and planned
            if entities.destination:
                self.history_service.save_history(user_id, entities)
                history = self.history_service.get_history(user_id)
                self.user_service.update_profile(user_id, history)
                context.history = {"saved": True}
