from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.place import Place, Hotel, Restaurant
from app.domain.entities.travel_intelligence import BudgetBreakdown, RouteMatrix

class IBudgetEngine(ABC):
    """
    Interface for computing granular, itemized travel budget estimations.
    """
    @abstractmethod
    async def estimate_budget(
        self,
        total_budget_limit: Optional[float],
        duration_days: int,
        places: List[Place],
        hotels: List[Hotel],
        restaurants: List[Restaurant],
        route_matrix: Optional[RouteMatrix] = None
    ) -> BudgetBreakdown:
        pass
