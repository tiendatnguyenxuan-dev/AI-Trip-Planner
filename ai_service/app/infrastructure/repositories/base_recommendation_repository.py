from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseRecommendationRepository(ABC):
    """
    Abstract interface for retrieving destination recommendations.
    """
    @abstractmethod
    def get_destination_data(self, destination: str) -> Optional[Dict[str, Any]]:
        """
        Fetch places and hotels for a given destination.
        """
        pass
