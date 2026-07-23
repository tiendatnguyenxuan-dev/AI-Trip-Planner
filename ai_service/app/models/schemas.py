from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

#Input nhận từ Java backend (text, user_id)
class ParseRequest(BaseModel):
    text: str = Field(..., json_schema_extra={"example": "đi đà lạt 3 ngày 2 đêm budget 2tr chill"})
    user_id: Optional[str] = None

# JSON output chứa các entities
class EntityResponse(BaseModel):
    destination: Optional[str] = None
    duration_days: Optional[int] = None
    budget: Optional[int] = None
    vibe: Optional[str] = None
    time: Optional[str] = None
    group_type: Optional[str] = None
    travelers: Optional[int] = None
    destination_is_suggested: bool = False
    origin: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    class Config:
        extra = "ignore"

# Wrapper chứa intent, entities, confidence, source
class ParseResponse(BaseModel):
    intent: str
    entities: EntityResponse
    confidence: float
    source: str

class PlaceItem(BaseModel):
    name: str
    type: str
    score: Optional[float] = None
    reason: Optional[str] = None
    matched_tags: List[str] = Field(default_factory=list)

class HotelItem(BaseModel):
    name: str
    price_level: str
    score: Optional[float] = None
    reason: Optional[str] = None

class RecommendationResponse(BaseModel):
    places: List[PlaceItem]
    hotels: List[HotelItem]

class DailyItinerary(BaseModel):
    day: int
    activities: List[str]

class ItineraryResponse(BaseModel):
    days: List[DailyItinerary]

class TripPlanResponse(BaseModel):
    intent: str
    entities: EntityResponse
    recommendations: RecommendationResponse
    itinerary: ItineraryResponse
    personalized: bool = False
    
    # V2 optional fields
    trip: Optional[Dict[str, Any]] = None
    validation_summary: Optional[Dict[str, Any]] = None
    places_metadata: Optional[List[Dict[str, Any]]] = None

from app.domain.entities.place import Place, Hotel, Restaurant

class CandidatePlaces(BaseModel):
    places: List[Place]
    hotels: List[Hotel]
    restaurants: List[Restaurant]

# --- Phase 5 Conversational Planning Schemas ---
class ModifyItineraryRequest(BaseModel):
    user_prompt: str
    modification_scope: Optional[str] = "GENERAL"
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    existing_trip: Optional[Dict[str, Any]] = None
    user_profile: Optional[Dict[str, Any]] = None

class ModifyItineraryResponse(BaseModel):
    content: str
    partial_update: Optional[Dict[str, Any]] = None
    modified_components: List[str] = Field(default_factory=list)
