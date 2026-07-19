import logging
from typing import Dict, Any, List, Optional
from app.models.schemas import TripPlanResponse, RecommendationResponse, ItineraryResponse
from app.shared.context.trip_context import TripContext

logger = logging.getLogger(__name__)

class TripPipeline:
    """
    Orchestration pipeline executing sequential travel planning nodes.
    Supports Validation, Automatic Repair, and V2 Response Model compilation.
    """
    def __init__(self, nodes=None, validation_service=None, repair_service=None):
        if nodes is None:
            from app.shared.di import container
            nodes = [
                container.fetch_user_node,
                container.parse_node,
                container.personalization_node,
                container.recommendation_node,
                container.planning_node,
                container.history_node
            ]
        self.nodes = nodes
        self.validation_service = validation_service
        self.repair_service = repair_service

    async def execute(self, context: TripContext) -> TripPlanResponse:
        logger.info(f"--- Trip Planning Execution Started ---")
        
        for node in self.nodes:
            logger.info(f"Executing node: {node.name}")
            await node.before_execute(context)
            await node.validate(context)
            await node.execute(context)
            await node.after_execute(context)
            
        logger.info(f"--- Trip Planning Execution Completed ---")
        
        # Assemble final response from context
        intent = context.parsed_query.intent if context.parsed_query else "UNKNOWN"
        entities = context.parsed_query.entities if context.parsed_query else None
        recommendations = context.recommendations or RecommendationResponse(places=[], hotels=[])
        itinerary = context.itinerary or ItineraryResponse(days=[])
        personalized = context.metadata.get("personalized", False)
        
        # --- Validation & Repair Stage ---
        val_summary = {"is_valid": True, "errors": [], "warnings": []}
        if context.itinerary and context.candidate_places and self.validation_service:
            budget_limit = entities.budget if entities and entities.budget else 5_000_000
            val_res = self.validation_service.validate_itinerary(
                context.itinerary, context.candidate_places, budget_limit
            )
            if not val_res["is_valid"] and self.repair_service:
                logger.info("Validation failed. Attempting automatic itinerary repair...")
                repaired = self.repair_service.repair_itinerary(
                    context.itinerary, val_res["errors"], context.candidate_places
                )
                context.itinerary = repaired
                val_res = self.validation_service.validate_itinerary(
                    context.itinerary, context.candidate_places, budget_limit
                )
            val_summary = val_res

        # --- V2 Response Metadata ---
        places_meta = []
        if context.candidate_places:
            for p in context.candidate_places.places:
                places_meta.append(p.dict())
            for h in context.candidate_places.hotels:
                places_meta.append(h.dict())
            for r in context.candidate_places.restaurants:
                places_meta.append(r.dict())

        trip_meta = {
            "destination": entities.destination if entities else None,
            "duration_days": entities.duration_days if entities else 1,
            "budget": entities.budget if entities else None,
            "vibe": entities.vibe if entities else None
        }
        
        return TripPlanResponse(
            intent=intent,
            entities=entities,
            recommendations=recommendations,
            itinerary=context.itinerary,
            personalized=personalized,
            trip=trip_meta,
            validation_summary=val_summary,
            places_metadata=places_meta
        )

trip_pipeline = TripPipeline()
