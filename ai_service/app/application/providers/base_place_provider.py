from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities.place import Place, Hotel, Restaurant

class BasePlaceProvider(ABC):
    """
    Abstract interface for external Place data providers (port).
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier name."""
        pass

    @abstractmethod
    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        pass

    @abstractmethod
    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        pass

    @abstractmethod
    def search_hotels(self, destination: str) -> List[Hotel]:
        pass

    @abstractmethod
    def search_restaurants(self, destination: str) -> List[Restaurant]:
        pass

    @abstractmethod
    def destination_exists(self, destination: str) -> bool:
        pass
