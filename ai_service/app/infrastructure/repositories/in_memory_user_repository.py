from typing import Dict, Any, Optional
from app.application.repositories.base_user_repository import BaseUserRepository

# Keep a shared in-memory dictionary for profiles persistence
_user_profiles_db: Dict[str, Dict[str, Any]] = {}

class InMemoryUserRepository(BaseUserRepository):
    """
    In-memory implementation of BaseUserRepository.
    """
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        return _user_profiles_db.get(user_id, {})

    def save_profile(self, user_id: str, profile: Dict[str, Any]) -> None:
        _user_profiles_db[user_id] = profile
