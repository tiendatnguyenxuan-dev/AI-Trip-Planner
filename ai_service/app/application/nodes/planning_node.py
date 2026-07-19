from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.models.schemas import ItineraryResponse

class PlanningNode(BaseNode):
    """
    Generates a day-by-day travel itinerary using only candidates.
    """
    def __init__(self, itinerary_service):
        self.itinerary_service = itinerary_service

    @property
    def name(self) -> str:
        return "PlanningNode"

    async def execute(self, context: TripContext) -> None:
        if not context.parsed_query:
            return
            
        entities = context.parsed_query.entities
        destination = entities.destination
        if not destination:
            context.itinerary = ItineraryResponse(days=[])
            return
            
        # Compile candidate place names to restrict LLM inventory
        cand_names = []
        candidates = context.candidate_places
        if candidates:
            cand_names.extend([p.name for p in candidates.places])
            cand_names.extend([h.name for h in candidates.hotels])
            cand_names.extend([r.name for r in candidates.restaurants])
            
        itin_data = await self.itinerary_service.generate_itinerary(
            destination=destination,
            duration_days=entities.duration_days,
            budget=entities.budget,
            vibe=entities.vibe,
            group_type=entities.group_type,
            candidate_places=cand_names
        )
        context.itinerary = ItineraryResponse(**itin_data)
