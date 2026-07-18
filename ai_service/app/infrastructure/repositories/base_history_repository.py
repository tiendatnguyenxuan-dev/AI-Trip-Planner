from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseHistoryRepository(ABC):
    """
    Abstract interface for managing user travel history.
    """
    @abstractmethod
    def save_history(self, user_id: str, history_entry: Dict[str, Any]) -> None:
        """
        Persist a user's travel history entry.
        """
        pass

    @abstractmethod
    def get_history(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve travel history for a user.
        """
        pass
