from typing import Dict, Any, Optional
from app.models.schemas import ParseResponse, RecommendationResponse, ItineraryResponse

class TripContext:
    """
    TripContext serves as the shared state object passed down the execution pipeline.
    It encapsulates the raw request, intermediate processing steps, models, results,
    and execution metadata.
    """
    def __init__(self, text: str, user_id: Optional[str] = None):
        self.request = {
            "text": text,
            "user_id": user_id
        }
        self.user_profile: Dict[str, Any] = {}
        self.parsed_query: Optional[ParseResponse] = None
        self.recommendations: Optional[RecommendationResponse] = None
        self.itinerary: Optional[ItineraryResponse] = None
        self.history: Optional[Any] = None
        self.metadata: Dict[str, Any] = {}
        self.execution_metrics: Dict[str, Any] = {}
        self.validation_result: Optional[Any] = None
