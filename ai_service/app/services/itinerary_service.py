import random
from typing import Dict, Any, List
from app.application.repositories.base_recommendation_repository import BaseRecommendationRepository
from app.infrastructure.repositories.json_recommendation_repository import JSONRecommendationRepository

class ItineraryService:
    """
    Service coordinating travel itinerary generation.
    Checks destination dataset first before calling LLM.
    """
    def __init__(self, recommendation_repository: BaseRecommendationRepository = None, llm_service = None):
        self.recommendation_repository = recommendation_repository or JSONRecommendationRepository()
        self.llm_service = llm_service

    async def generate_itinerary(self, destination: str, duration_days: int, budget: int, vibe: str, group_type: str) -> Dict[str, Any]:
        if not destination or not duration_days or duration_days <= 0:
            return {"days": []}
            
        # Limit to max 10 days to avoid huge outputs
        duration_days = min(duration_days, 10)

        # --- DATASET FALLBACK LOGIC ---
        dest_data = self.recommendation_repository.get_destination_data(destination)
        if dest_data:
            # Generate mock itinerary from dataset
            return self._generate_mock_itinerary(dest_data, duration_days)

        # Call the LLM service to generate the itinerary
        if self.llm_service:
            return await self.llm_service.generate_itinerary(
                destination=destination,
                duration_days=duration_days,
                budget=budget or 0,
                vibe=vibe or "tự do",
                group_type=group_type or "solo"
            )
        return {"days": []}
        
    def _generate_mock_itinerary(self, dest_data: Dict[str, Any], duration_days: int) -> Dict[str, Any]:
        days = []
        places = dest_data.get("places", [])
        restaurants = dest_data.get("restaurants", [])
        
        for d in range(1, duration_days + 1):
            morning_place = random.choice(places)["name"] if places else "Khám phá tự do"
            afternoon_place = random.choice(places)["name"] if places else "Tham quan thành phố"
            lunch = random.choice(restaurants)["name"] if restaurants else "Nhà hàng địa phương"
            dinner = random.choice(restaurants)["name"] if restaurants else "Đặc sản địa phương"
            
            days.append({
                "day": d,
                "activities": [
                    f"Morning: Tham quan {morning_place}",
                    f"Lunch: Ăn trưa tại {lunch}",
                    f"Afternoon: Di chuyển đến {afternoon_place}",
                    f"Evening: Ăn tối tại {dinner} và tự do khám phá"
                ]
            })
        return {"days": days}

itinerary_service = ItineraryService()
