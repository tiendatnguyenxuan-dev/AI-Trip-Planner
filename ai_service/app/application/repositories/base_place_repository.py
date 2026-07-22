from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities.place import Place, Hotel, Restaurant

class BasePlaceRepository(ABC):
    """
    Abstract interface for retrieving Place data (domain port).
    Exposes only data access methods, never containing recommendation logic.
    """
    @abstractmethod
    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        """Retrieve a specific place by its unique ID."""
        pass

    @abstractmethod
    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        """Search for generic places matching query/destination filters."""
        pass

    @abstractmethod
    def search_hotels(self, destination: str) -> List[Hotel]:
        """Retrieve all hotels for a given destination."""
        pass

    @abstractmethod
    def search_restaurants(self, destination: str) -> List[Restaurant]:
        """Retrieve all restaurants for a given destination."""
        pass

    @abstractmethod
    def destination_exists(self, destination: str) -> bool:
        """Check if destination data exists in the repository."""
        pass
