from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseUserRepository(ABC):
    """
    Abstract interface for managing user profile persistence (domain port).
    """
    @abstractmethod
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user profile metrics.
        """
        pass

    @abstractmethod
    def save_profile(self, user_id: str, profile: Dict[str, Any]) -> None:
        """
        Save/update user profile metrics.
        """
        pass
