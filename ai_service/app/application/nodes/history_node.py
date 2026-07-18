from typing import Any
from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.infrastructure.repositories.base_history_repository import BaseHistoryRepository
from app.infrastructure.repositories.file_history_repository import FileHistoryRepository
from app.services.user_service import user_service

class HistoryNode(BaseNode):
    """
    Saves the processed trip details into the user's travel history and updates user metrics
    by calling the history repository directly.
    """
    def __init__(self, repository: BaseHistoryRepository = None):
        self.repository = repository or FileHistoryRepository()

    @property
    def name(self) -> str:
        return "HistoryNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id and context.parsed_query:
            entities = context.parsed_query.entities
            # Only save history if a valid destination was parsed and planned
            if entities.destination:
                dest = entities.destination if entities.destination and "[LLM Repaired]" not in entities.destination else None
                vibe = entities.vibe if entities.vibe and "[LLM Repaired]" not in entities.vibe else None
                
                try:
                    budget = int(entities.budget) if entities.budget is not None else None
                except (ValueError, TypeError):
                    budget = None

                history_entry = {
                    "destination": dest,
                    "vibe": vibe,
                    "budget": budget
                }
                
                if any(history_entry.values()):
                    self.repository.save_history(user_id, history_entry)
                    user_service.update_profile(user_id)
                    context.history = {"saved": True}
