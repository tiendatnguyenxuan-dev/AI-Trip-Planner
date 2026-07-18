from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.user_service import user_service

class FetchUserNode(BaseNode):
    """
    Fetches the user's profile if user_id is provided.
    """
    @property
    def name(self) -> str:
        return "FetchUserNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id:
            context.user_profile = user_service.get_profile(user_id)
