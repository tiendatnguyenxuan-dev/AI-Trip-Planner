import logging
from app.pipelines.parse_pipeline import parse_pipeline
from app.services.recommendation_service import recommendation_service
from app.services.itinerary_service import itinerary_service
from app.services.user_service import user_service
from app.services.history_service import history_service
from app.services.personalization_service import personalization_service
from app.models.schemas import TripPlanResponse, RecommendationResponse, ItineraryResponse

logger = logging.getLogger(__name__)

class TripPipeline:
    async def execute(self, text: str, user_id: str = None) -> TripPlanResponse:
        logger.info(f"--- Trip Planning Execution Started ---")
        
        # 1. Fetch User Profile
        profile = {}
        if user_id:
            profile = user_service.get_profile(user_id)
            
        # 2. Parse Query (with profile context)
        parse_result = await parse_pipeline.execute(text, user_id=user_id)
        entities = parse_result.entities
        
        # 3. Personalization (Rule-based enhancement for fast-path or misses)
        personalized = False
        if user_id:
            entities, personalized = personalization_service.enhance_entities(entities, profile)
        
        destination = entities.destination
        budget = entities.budget
        vibe = entities.vibe
        duration_days = entities.duration_days
        
        if not destination:
            # Fallback if no destination was found (even after LLM repair and personalization)
            logger.warning("No destination found. Cannot generate itinerary.")
            return TripPlanResponse(
                intent=parse_result.intent,
                entities=entities,
                recommendations=RecommendationResponse(places=[], hotels=[]),
                itinerary=ItineraryResponse(days=[]),
                personalized=personalized
            )
            
        # 3. Get Recommendations
        rec_data = recommendation_service.get_recommendations(destination, budget, vibe)
        
        # 4. Generate Itinerary
        itin_data = await itinerary_service.generate_itinerary(
            destination=destination, 
            duration_days=duration_days,
            budget=budget,
            vibe=vibe,
            group_type=entities.group_type
        )

        
        # 5. Save History & Update Profile
        if user_id:
            history_service.save_history(user_id, entities)
            user_service.update_profile(user_id)
        
        logger.info(f"--- Trip Planning Execution Completed ---")
        
        # 6. Assemble Final Response
        return TripPlanResponse(
            intent=parse_result.intent,
            entities=entities,
            recommendations=RecommendationResponse(**rec_data),
            itinerary=ItineraryResponse(**itin_data),
            personalized=personalized
        )

trip_pipeline = TripPipeline()
