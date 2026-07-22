from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.domain.entities.place import Place
from app.domain.entities.travel_intelligence import RouteMatrix, WeatherReport, OptimizedActivity

class ITimelineOptimizer(ABC):
    """
    Interface for deterministic time-window scheduling and route sequencing.
    """
    @abstractmethod
    async def optimize_daily_timeline(
        self,
        day_number: int,
        candidate_places: List[Place],
        route_matrix: RouteMatrix,
        weather: Optional[WeatherReport] = None,
        max_activities_per_day: int = 4
    ) -> List[OptimizedActivity]:
        pass
