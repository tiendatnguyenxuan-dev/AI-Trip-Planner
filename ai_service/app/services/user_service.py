from typing import Dict, Any, List
from collections import Counter
from app.application.repositories.base_user_repository import BaseUserRepository
from app.infrastructure.repositories.in_memory_user_repository import InMemoryUserRepository

class UserService:
    """
    Service coordinating user profile updates and metrics extraction.
    """
    def __init__(self, repository: BaseUserRepository = None):
        self.repository = repository or InMemoryUserRepository()

    def update_profile(self, user_id: str, history: List[Dict[str, Any]]) -> None:
        if not user_id or not history:
            return
            
        vibes = [entry["vibe"] for entry in history if entry.get("vibe") and "[LLM Repaired]" not in entry["vibe"]]
        destinations = [entry["destination"] for entry in history if entry.get("destination") and "[LLM Repaired]" not in entry["destination"]]
        budgets = [int(entry["budget"]) for entry in history if entry.get("budget") is not None]
        
        preferred_vibe = Counter(vibes).most_common(1)[0][0] if vibes else None
        frequent_dest = Counter(destinations).most_common(1)[0][0] if destinations else None
        avg_budget = sum(budgets) / len(budgets) if budgets else None
        
        profile = {
            "preferred_vibe": preferred_vibe,
            "frequent_destination": frequent_dest,
            "avg_budget": avg_budget
        }
        self.repository.save_profile(user_id, profile)
        
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        return self.repository.get_profile(user_id) or {}

user_service = UserService()
