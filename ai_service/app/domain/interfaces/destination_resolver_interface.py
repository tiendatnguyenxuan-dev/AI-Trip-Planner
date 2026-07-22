from abc import ABC, abstractmethod
from typing import Optional
from app.domain.entities.travel_intelligence import DestinationEntity

class IDestinationResolver(ABC):
    """
    Interface for resolving raw text queries or city names into normalized destination entities.
    """
    @abstractmethod
    async def resolve(self, raw_query: str) -> Optional[DestinationEntity]:
        pass
