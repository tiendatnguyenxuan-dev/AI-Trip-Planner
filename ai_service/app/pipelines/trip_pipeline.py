import logging
from app.pipelines.parse_pipeline import parse_pipeline
from app.services.recommendation_service import recommendation_service
from app.services.itinerary_service import itinerary_service
from app.services.user_service import user_service
from app.services.history_service import history_service
from app.services.personalization_service import personalization_service
from app.models.schemas import TripPlanResponse, RecommendationResponse, ItineraryResponse

logger = logging.getLogger(__name__)

from app.shared.context.trip_context import TripContext

class TripPipeline:
    async def execute(self, context: TripContext) -> TripPlanResponse:
        logger.info(f"--- Trip Planning Execution Started ---")
        text = context.request["text"]
        user_id = context.request["user_id"]
        
        # 1. Fetch User Profile
        if user_id:
            context.user_profile = user_service.get_profile(user_id)
            
        # 2. Parse Query
        context.parsed_query = await parse_pipeline.execute(context)
        entities = context.parsed_query.entities
        
        # 3. Personalization (Rule-based enhancement for fast-path or misses)
        personalized = False
        if user_id:
            entities, personalized = personalization_service.enhance_entities(entities, context.user_profile)
            context.metadata["personalized"] = personalized
        
        destination = entities.destination
        budget = entities.budget
        vibe = entities.vibe
        duration_days = entities.duration_days
        
        if not destination:
            # Fallback if no destination was found (even after LLM repair and personalization)
            logger.warning("No destination found. Cannot generate itinerary.")
            response = TripPlanResponse(
                intent=context.parsed_query.intent,
                entities=entities,
                recommendations=RecommendationResponse(places=[], hotels=[]),
                itinerary=ItineraryResponse(days=[]),
                personalized=personalized
            )
            context.recommendations = response.recommendations
            context.itinerary = response.itinerary
            return response
            
        # 3. Get Recommendations
        rec_data = recommendation_service.get_recommendations(destination, budget, vibe)
        context.recommendations = RecommendationResponse(**rec_data)
        
        # 4. Generate Itinerary
        itin_data = await itinerary_service.generate_itinerary(
            destination=destination, 
            duration_days=duration_days,
            budget=budget,
            vibe=vibe,
            group_type=entities.group_type
        )
        context.itinerary = ItineraryResponse(**itin_data)
        
        # 5. Save History & Update Profile
        if user_id:
            history_service.save_history(user_id, entities)
            user_service.update_profile(user_id)
            context.history = {"saved": True}
        
        logger.info(f"--- Trip Planning Execution Completed ---")
        
        # 6. Assemble Final Response
        response = TripPlanResponse(
            intent=context.parsed_query.intent,
            entities=entities,
            recommendations=context.recommendations,
            itinerary=context.itinerary,
            personalized=personalized
        )
        return response

trip_pipeline = TripPipeline()
