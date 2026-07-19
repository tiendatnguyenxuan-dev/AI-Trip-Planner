import random
from typing import Dict, Any, List, Optional
from app.application.repositories.base_place_repository import BasePlaceRepository
from app.infrastructure.repositories.place_repository import PlaceRepository
from app.infrastructure.providers.static_dataset_provider import StaticDatasetProvider

class ItineraryService:
    """
    Service coordinating travel itinerary generation.
    Checks destination dataset first before calling LLM.
    """
    def __init__(self, recommendation_repository: BasePlaceRepository = None, llm_service = None):
        self.recommendation_repository = recommendation_repository or PlaceRepository(providers=[StaticDatasetProvider()])
        self.llm_service = llm_service

    async def generate_itinerary(
        self,
        destination: str,
        duration_days: int,
        budget: int,
        vibe: str,
        group_type: str,
        candidate_places: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        if not destination or not duration_days or duration_days <= 0:
            return {"days": []}
            
        duration_days = min(duration_days, 10)

        # --- DATASET FALLBACK LOGIC ---
        exists = self.recommendation_repository.destination_exists(destination)
        if exists and not candidate_places:
            hotels = self.recommendation_repository.search_hotels(destination)
            rests = self.recommendation_repository.search_restaurants(destination)
            places = self.recommendation_repository.search_places("", destination)
            return self._generate_mock_itinerary(hotels, rests, places, duration_days)

        # Call the LLM service to generate the itinerary
        if self.llm_service:
            return await self.llm_service.generate_itinerary(
                destination=destination,
                duration_days=duration_days,
                budget=budget or 0,
                vibe=vibe or "tự do",
                group_type=group_type or "solo",
                candidate_places=candidate_places
            )
        return {"days": []}
        
    def _generate_mock_itinerary(self, hotels: List[Any], rests: List[Any], places: List[Any], duration_days: int) -> Dict[str, Any]:
        days = []
        for d in range(1, duration_days + 1):
            morning_place = random.choice(places).name if places else "Khám phá tự do"
            afternoon_place = random.choice(places).name if places else "Tham quan thành phố"
            lunch = random.choice(rests).name if rests else "Nhà hàng địa phương"
            dinner = random.choice(rests).name if rests else "Đặc sản địa phương"
            
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
