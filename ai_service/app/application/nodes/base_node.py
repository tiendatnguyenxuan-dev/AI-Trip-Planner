from abc import ABC, abstractmethod
from app.shared.context.trip_context import TripContext

class BaseNode(ABC):
    """
    Base class representing a single step (node) in the execution pipeline.
    """
    @abstractmethod
    async def execute(self, context: TripContext) -> None:
        """
        Executes logic for this node and modifies TripContext in-place.
        """
        pass
