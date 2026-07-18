from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext

class FetchUserNode(BaseNode):
    """
    Fetches the user's profile if user_id is provided.
    """
    def __init__(self, user_service):
        self.user_service = user_service

    @property
    def name(self) -> str:
        return "FetchUserNode"

    async def execute(self, context: TripContext) -> None:
        user_id = context.request.get("user_id")
        if user_id:
            context.user_profile = self.user_service.get_profile(user_id)
