import logging
from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.services.travel_intelligence_service import TravelIntelligenceService

logger = logging.getLogger(__name__)

class TravelIntelligenceNode(BaseNode):
    """
    Pipeline node executing the Travel Intelligence Layer.
    Calculates route matrices, weather suitability, itemized budgets, and destination resolution,
    attaching the resulting EnrichedTravelContext into TripContext.
    """
    def __init__(self, intelligence_service: TravelIntelligenceService):
        self.intelligence_service = intelligence_service

    @property
    def name(self) -> str:
        return "TravelIntelligenceNode"

    async def execute(self, context: TripContext) -> None:
        if not context.candidate_places:
            logger.warning("No candidate places found in TripContext. Skipping TravelIntelligenceNode.")
            return

        query_text = context.request.get("text", "")
        entities = context.parsed_query.entities if context.parsed_query else None
        duration_days = entities.duration_days if entities and entities.duration_days else 1
        budget_limit = float(entities.budget) if entities and entities.budget else None

        enriched_context = await self.intelligence_service.enrich_context(
            query_text=query_text,
            places=context.candidate_places.places,
            hotels=context.candidate_places.hotels,
            restaurants=context.candidate_places.restaurants,
            duration_days=duration_days,
            budget_limit=budget_limit
        )

        context.travel_intelligence = enriched_context
        context.metadata["travel_intelligence_summary"] = {
            "canonical_destination": enriched_context.destination.canonical_name,
            "estimated_total_cost": enriched_context.budget_breakdown.total_estimated,
            "weather_condition": enriched_context.weather_forecast[0].condition.value if enriched_context.weather_forecast else "UNKNOWN"
        }
        logger.info(f"TravelIntelligenceNode executed. Attached destination: {enriched_context.destination.canonical_name}")
