from abc import ABC, abstractmethod
from app.shared.context.trip_context import TripContext

class BaseNode(ABC):
    """
    Base class representing a single step (node) in the execution pipeline.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable node name for logging and tracing."""
        pass

    @abstractmethod
    async def execute(
        self,
        context: TripContext
    ) -> None:
        """Execute business logic."""
        pass

    async def validate(
        self,
        context: TripContext
    ) -> None:
        """Optional precondition validation."""
        pass

    async def before_execute(
        self,
        context: TripContext
    ) -> None:
        """Lifecycle hook."""
        pass

    async def after_execute(
        self,
        context: TripContext
    ) -> None:
        """Lifecycle hook."""
        pass
