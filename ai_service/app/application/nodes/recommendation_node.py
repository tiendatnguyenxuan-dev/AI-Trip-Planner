from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext
from app.models.schemas import RecommendationResponse, PlaceItem, HotelItem

class RecommendationNode(BaseNode):
    """
    Retrieves venue, dining, and lodging recommendations matching the trip's metadata
    by calling the RecommendationEngine and storing CandidatePlaces inside context.
    """
    def __init__(self, recommendation_engine):
        self.recommendation_engine = recommendation_engine

    @property
    def name(self) -> str:
        return "RecommendationNode"

    async def execute(self, context: TripContext) -> None:
        if not context.parsed_query:
            return
            
        entities = context.parsed_query.entities
        destination = entities.destination
        if not destination:
            context.recommendations = RecommendationResponse(places=[], hotels=[])
            return
            
        preferred_tags = [entities.vibe] if entities.vibe else []
        candidates = self.recommendation_engine.get_candidate_recommendations(
            destination=destination,
            budget=entities.budget,
            preferred_tags=preferred_tags,
            user_profile=context.user_profile
        )
        
        context.candidate_places = candidates
        
        # Map to legacy DTO for backwards compatibility, with enriched explainability
        places_dto = []
        for p in candidates.places:
            score = round(getattr(p, "_score", 4.5), 2)
            reason = f"Được đề xuất vì phù hợp phong cách '{entities.vibe or 'du lịch'}' và đánh giá đạt {p.metadata.rating if p.metadata else 4.5}/5.0."
            matched_tags = p.metadata.tags if p.metadata else []
            places_dto.append(PlaceItem(name=p.name, type=p.type, score=score, reason=reason, matched_tags=matched_tags))
            
        hotels_dto = []
        for h in candidates.hotels:
            score = round(getattr(h, "_score", 4.0), 2)
            reason = f"Khách sạn tốt nhất phù hợp tầm giá với đánh giá {h.metadata.rating if h.metadata else 4.0}/5.0."
            hotels_dto.append(HotelItem(name=h.name, price_level=h.price_level or "medium", score=score, reason=reason))

        context.recommendations = RecommendationResponse(places=places_dto, hotels=hotels_dto)
