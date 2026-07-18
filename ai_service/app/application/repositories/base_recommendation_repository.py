from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class BaseRecommendationRepository(ABC):
    """
    Abstract interface for retrieving destination recommendations (domain port).
    """
    @abstractmethod
    def get_destination_data(self, destination: str) -> Optional[Dict[str, Any]]:
        """
        Fetch places and hotels for a given destination.
        """
        pass

    @abstractmethod
    def get_all_destinations(self) -> List[str]:
        """
        Retrieve a list of all configured destination names.
        """
        pass
