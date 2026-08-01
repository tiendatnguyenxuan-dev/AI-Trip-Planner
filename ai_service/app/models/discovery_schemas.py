from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.domain.media.media_item import MediaItem

class DestinationInfo(BaseModel):
    destination_id: str
    canonical_name: str
    province: Optional[str] = None
    country: str = "Vietnam"
    lat: float
    lng: float
    viewport: Dict[str, float] = Field(default_factory=dict)
    default_zoom: int = 13

class MapMarker(BaseModel):
    id: str
    title: str
    type: str  # "POI" | "HOTEL" | "RESTAURANT" | "ATTRACTION" | "MEDIA"
    lat: float
    lng: float
    rating: Optional[float] = 4.5
    category: Optional[str] = "sightseeing"
    thumbnail: Optional[str] = None

class MapContext(BaseModel):
    center: Dict[str, float]
    zoom: int
    bounds: Dict[str, float] = Field(default_factory=dict)
    markers: List[MapMarker] = Field(default_factory=list)

class WeatherInfo(BaseModel):
    temp_c: int = 28
    condition: str = "Nắng nhẹ, gió mát"
    icon: str = "sunny"
    humidity: int = 75
    forecast_summary: str = "Thời tiết lý tưởng cho các hoạt động tham quan & tắm biển."

class DiscoverRequest(BaseModel):
    query: str
    user_id: Optional[str] = None

class DestinationDiscoveryContext(BaseModel):
    destination: DestinationInfo
    map_context: MapContext
    pois: List[Dict[str, Any]] = Field(default_factory=list)
    media_items: List[MediaItem] = Field(default_factory=list)
    weather: WeatherInfo = Field(default_factory=WeatherInfo)
    recommendations_preview: List[Dict[str, Any]] = Field(default_factory=list)
    conversation_suggestions: List[str] = Field(default_factory=list)

class DiscoverResponse(BaseModel):
    discovery_context: DestinationDiscoveryContext
