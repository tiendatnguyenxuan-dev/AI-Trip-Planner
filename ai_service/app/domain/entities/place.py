from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class PriceLevel(str, Enum):
    BUDGET = "BUDGET"
    MODERATE = "MODERATE"
    EXPENSIVE = "EXPENSIVE"
    ULTRA_LUXURY = "ULTRA_LUXURY"

class Coordinates(BaseModel):
    latitude: float
    longitude: float
    geohash: Optional[str] = None
    viewport: Optional[Dict[str, Any]] = None

class Address(BaseModel):
    province: Optional[str] = None
    district: Optional[str] = None
    country: Optional[str] = "Vietnam"
    full_address: Optional[str] = None

class OpeningHours(BaseModel):
    periods: List[Dict[str, Any]] = Field(default_factory=list)
    open_now: Optional[bool] = None
    weekday_text: List[str] = Field(default_factory=list)

class Media(BaseModel):
    photos: List[str] = Field(default_factory=list)
    videos: List[str] = Field(default_factory=list)
    thumbnails: List[str] = Field(default_factory=list)

class Metadata(BaseModel):
    rating: Optional[float] = None
    review_count: Optional[int] = None
    provider: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    price_level: Optional[PriceLevel] = None
    opening_hours: Optional[OpeningHours] = None
    media: Optional[Media] = None

class Place(BaseModel):
    place_id: str
    provider: str
    external_id: str
    name: str
    description: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    address: Optional[Address] = None
    metadata: Optional[Metadata] = None
    type: str # 'hotel', 'restaurant', 'attraction'
    
    # Root level field retained for backward compatibility with old DTOs
    price_level: Optional[str] = None

class Hotel(Place):
    type: str = "hotel"
    stars: Optional[float] = None

class Restaurant(Place):
    type: str = "restaurant"
    cuisine: Optional[str] = None

class Attraction(Place):
    type: str = "attraction"
    duration_minutes: Optional[int] = None
