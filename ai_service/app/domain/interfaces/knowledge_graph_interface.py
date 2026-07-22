from abc import ABC, abstractmethod
from typing import List, Dict

class IKnowledgeGraph(ABC):
    """
    Interface for querying semantic place relationships and clustering rules.
    """
    @abstractmethod
    async def get_related_places(self, place_id: str, relationship_type: str = "PAIR_WELL_WITH") -> List[str]:
        pass

    @abstractmethod
    async def get_clusters(self, destination_id: str) -> Dict[str, List[str]]:
        pass
