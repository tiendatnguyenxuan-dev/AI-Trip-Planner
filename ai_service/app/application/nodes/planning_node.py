from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.models.schemas import ItineraryResponse, DailyItinerary

class PlanningNode(BaseNode):
    """
    Generates a day-by-day travel itinerary using candidates and Travel Intelligence Layer context.
    """
    def __init__(self, itinerary_service, timeline_optimizer=None):
        self.itinerary_service = itinerary_service
        self.timeline_optimizer = timeline_optimizer

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

        # Attempt deterministic timeline generation if Travel Intelligence context exists
        if context.travel_intelligence and self.timeline_optimizer and context.candidate_places:
            days = []
            dur_days = entities.duration_days or 1
            places = context.candidate_places.places
            
            for d in range(1, dur_days + 1):
                optimized_acts = await self.timeline_optimizer.optimize_daily_timeline(
                    day_number=d,
                    candidate_places=places,
                    route_matrix=context.travel_intelligence.route_matrix,
                    weather=context.travel_intelligence.weather_forecast[0] if context.travel_intelligence.weather_forecast else None
                )
                
                activities_str = []
                for act in optimized_acts:
                    activities_str.append(
                        f"[{act.suggested_start_time} - {act.suggested_end_time}] {act.place_name} "
                        f"(Transit: {act.transit_from_previous_mins}m, {act.distance_from_previous_km}km)"
                    )
                days.append(DailyItinerary(day=d, activities=activities_str if activities_str else ["Khám phá tự do"]))
            
            context.itinerary = ItineraryResponse(days=days)
            return

        # Fallback to LLM / Standard Itinerary service
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
