from typing import List, Optional, Dict, Any
from app.application.repositories.base_place_repository import BasePlaceRepository
from app.domain.entities.place import Place, Hotel, Restaurant, Attraction, PriceLevel
from app.models.schemas import CandidatePlaces

class RecommendationEngine:
    """
    Engine coordinating candidate retrieval, preference filtering, budget matching, 
    duplicate removal, and coordinate distance scoring. Never calls the LLM.
    """
    def __init__(self, place_repository: BasePlaceRepository, ranking_engine = None):
        self.place_repository = place_repository
        self.ranking_engine = ranking_engine

    def get_candidate_recommendations(
        self,
        destination: str,
        budget: Optional[int] = None,
        preferred_tags: Optional[List[str]] = None,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> CandidatePlaces:
        """
        Retrieves, filters, and ranks candidate places matching criteria, returning a CandidatePlaces wrapper.
        """
        # 1. Candidate Retrieval
        hotels = self.place_repository.search_hotels(destination)
        restaurants = self.place_repository.search_restaurants(destination)
        attractions = self.place_repository.search_places(query="", destination=destination)
        
        # Filter and remove duplicates
        seen_attractions = set()
        unique_attractions = []
        for p in attractions:
            if p.place_id not in seen_attractions:
                seen_attractions.add(p.place_id)
                if p.type in ("attraction", "place"):
                    unique_attractions.append(p)

        # 2. Budget Threshold Mapping
        max_price_level = PriceLevel.MODERATE
        if budget is not None:
            if budget < 1_000_000:
                max_price_level = PriceLevel.BUDGET
            elif budget > 5_000_000:
                max_price_level = PriceLevel.ULTRA_LUXURY
            elif budget > 3_000_000:
                max_price_level = PriceLevel.EXPENSIVE

        # Filter hotels and restaurants by budget
        filtered_hotels = [
            h for h in hotels 
            if not h.metadata or not h.metadata.price_level or h.metadata.price_level <= max_price_level
        ]
        filtered_restaurants = [
            r for r in restaurants
            if not r.metadata or not r.metadata.price_level or r.metadata.price_level <= max_price_level
        ]

        # 3. Ranking and Sorting
        if self.ranking_engine:
            ranked_attractions = self.ranking_engine.rank(unique_attractions, preferred_tags, budget)
            ranked_hotels = self.ranking_engine.rank(filtered_hotels, preferred_tags, budget)
            ranked_restaurants = self.ranking_engine.rank(filtered_restaurants, preferred_tags, budget)
        else:
            def rating_key(x):
                return (x.metadata.rating if x.metadata else 0.0) or 0.0
            ranked_attractions = sorted(unique_attractions, key=rating_key, reverse=True)
            ranked_hotels = sorted(filtered_hotels, key=rating_key, reverse=True)
            ranked_restaurants = sorted(filtered_restaurants, key=rating_key, reverse=True)

        return CandidatePlaces(
            places=ranked_attractions,
            hotels=ranked_hotels,
            restaurants=ranked_restaurants
        )
