from abc import ABC, abstractmethod
from typing import List, Dict, Tuple
from app.domain.entities.place import Place
from app.domain.entities.travel_intelligence import RouteMatrix, RouteSegment, TransitMode

class IRouteEngine(ABC):
    """
    Interface for calculating distances, durations, and spatial matrices between travel candidates.
    """
    @abstractmethod
    async def get_route(self, origin: Place, destination: Place, mode: TransitMode = TransitMode.CAR) -> RouteSegment:
        pass

    @abstractmethod
    async def compute_matrix(self, places: List[Place], mode: TransitMode = TransitMode.CAR) -> RouteMatrix:
        pass
