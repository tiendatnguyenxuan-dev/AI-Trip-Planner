from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.itinerary_service import itinerary_service
from app.models.schemas import ItineraryResponse

class PlanningNode(BaseNode):
    """
    Generates a day-by-day travel itinerary for the trip.
    """
    async def execute(self, context: TripContext) -> None:
        if not context.parsed_query:
            return
            
        entities = context.parsed_query.entities
        destination = entities.destination
        if not destination:
            context.itinerary = ItineraryResponse(days=[])
            return
            
        itin_data = await itinerary_service.generate_itinerary(
            destination=destination,
            duration_days=entities.duration_days,
            budget=entities.budget,
            vibe=entities.vibe,
            group_type=entities.group_type
        )
        context.itinerary = ItineraryResponse(**itin_data)
