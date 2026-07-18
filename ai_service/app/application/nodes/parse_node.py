from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.pipelines.parse_pipeline import parse_pipeline

class ParseNode(BaseNode):
    """
    Parses natural language input queries into structured entities.
    """
    @property
    def name(self) -> str:
        return "ParseNode"

    async def execute(self, context: TripContext) -> None:
        # Executes the existing parse_pipeline logic
        await parse_pipeline.execute(context)
