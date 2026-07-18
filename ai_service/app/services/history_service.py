from typing import Dict, Any, List
from app.application.repositories.base_history_repository import BaseHistoryRepository
from app.infrastructure.repositories.file_history_repository import FileHistoryRepository

class HistoryService:
    """
    Service coordinating travel history saves and lookups.
    Delegates persistence to BaseHistoryRepository.
    """
    def __init__(self, repository: BaseHistoryRepository = None):
        self.repository = repository or FileHistoryRepository()

    def save_history(self, user_id: str, entities: Any) -> None:
        if not user_id:
            return
            
        dest = entities.destination if entities.destination and "[LLM Repaired]" not in entities.destination else None
        vibe = entities.vibe if entities.vibe and "[LLM Repaired]" not in entities.vibe else None
        
        try:
            budget = int(entities.budget) if entities.budget is not None else None
        except (ValueError, TypeError):
            budget = None

        history_entry = {
            "destination": dest,
            "vibe": vibe,
            "budget": budget
        }
        
        # Only save if there's some meaningful data
        if any(history_entry.values()):
            self.repository.save_history(user_id, history_entry)
            
    def get_history(self, user_id: str) -> List[Dict[str, Any]]:
        return self.repository.get_history(user_id)

history_service = HistoryService()
