from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext

class ParseNode(BaseNode):
    """
    Parses natural language input queries into structured entities.
    """
    def __init__(self, parse_pipeline):
        self.parse_pipeline = parse_pipeline

    @property
    def name(self) -> str:
        return "ParseNode"

    async def execute(self, context: TripContext) -> None:
        await self.parse_pipeline.execute(context)
