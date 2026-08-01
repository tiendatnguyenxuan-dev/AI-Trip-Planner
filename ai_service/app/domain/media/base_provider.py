from abc import ABC, abstractmethod
from typing import List
from app.domain.media.media_item import MediaItem

class BaseMediaProvider(ABC):
    """
    Abstract interface for travel media providers.
    """
    @abstractmethod
    def search(self, destination: str, limit: int = 10) -> List[MediaItem]:
        """
        Searches for travel media given a destination.
        """
        pass
