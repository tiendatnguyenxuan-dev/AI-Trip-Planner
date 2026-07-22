import logging
from typing import List, Dict
from app.domain.interfaces.knowledge_graph_interface import IKnowledgeGraph

logger = logging.getLogger(__name__)

# Pre-defined semantic relations between places
KNOWN_RELATIONSHIPS = {
    "PAIR_WELL_WITH": {
        "p1": ["p2", "p3"],
        "p2": ["p1"],
    }
}

class InMemoryKnowledgeGraph(IKnowledgeGraph):
    """
    In-memory knowledge graph implementation tracking semantic place relationship clusters.
    """
    async def get_related_places(self, place_id: str, relationship_type: str = "PAIR_WELL_WITH") -> List[str]:
        rel_map = KNOWN_RELATIONSHIPS.get(relationship_type, {})
        return rel_map.get(place_id, [])

    async def get_clusters(self, destination_id: str) -> Dict[str, List[str]]:
        return {
            "culture_cluster": ["museum", "temple", "gallery"],
            "foodie_cluster": ["street_food", "night_market", "cafe"]
        }
