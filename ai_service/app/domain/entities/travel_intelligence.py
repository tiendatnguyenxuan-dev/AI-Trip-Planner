from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class TransitMode(str, Enum):
    WALKING = "WALKING"
    MOTORBIKE = "MOTORBIKE"
    CAR = "CAR"
    PUBLIC_TRANSIT = "PUBLIC_TRANSIT"

class DestinationEntity(BaseModel):
    destination_id: str
    canonical_name: str
    aliases: List[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    province: Optional[str] = None
    country: str = "Vietnam"
    timezone: str = "Asia/Ho_Chi_Minh"
    bounding_box: Optional[Dict[str, float]] = None

class RouteSegment(BaseModel):
    origin_place_id: str
    destination_place_id: str
    distance_meters: float
    duration_seconds: float
    transit_mode: TransitMode = TransitMode.CAR
    polyline: Optional[str] = None

class RouteMatrix(BaseModel):
    matrix: Dict[str, Dict[str, RouteSegment]] = Field(default_factory=dict)
    
    def get_segment(self, origin_id: str, dest_id: str) -> Optional[RouteSegment]:
        return self.matrix.get(origin_id, {}).get(dest_id)

class WeatherCondition(str, Enum):
    CLEAR = "CLEAR"
    CLOUDY = "CLOUDY"
    LIGHT_RAIN = "LIGHT_RAIN"
    HEAVY_RAIN = "HEAVY_RAIN"
    THUNDERSTORMS = "THUNDERSTORMS"

class WeatherReport(BaseModel):
    date: str
    condition: WeatherCondition
    temp_celsius_min: float
    temp_celsius_max: float
    precipitation_probability: float
    is_suitable_for_outdoor: bool = True

class ItemizedCost(BaseModel):
    category: str  # 'ACCOMMODATION', 'FOOD', 'TRANSPORT', 'ATTRACTION'
    estimated_amount: float
    currency: str = "VND"
    notes: Optional[str] = None

class BudgetBreakdown(BaseModel):
    total_estimated: float
    currency: str = "VND"
    accommodation_cost: float = 0.0
    food_cost: float = 0.0
    transport_cost: float = 0.0
    attractions_cost: float = 0.0
    items: List[ItemizedCost] = Field(default_factory=list)

class TemporalWindow(BaseModel):
    open_time: str  # HH:MM
    close_time: str # HH:MM
    is_open: bool = True

class OptimizedActivity(BaseModel):
    place_id: str
    place_name: str
    suggested_start_time: str  # HH:MM
    suggested_end_time: str    # HH:MM
    duration_minutes: int
    transit_from_previous_mins: float = 0.0
    distance_from_previous_km: float = 0.0

class EnrichedTravelContext(BaseModel):
    destination: DestinationEntity
    route_matrix: Optional[RouteMatrix] = None
    weather_forecast: List[WeatherReport] = Field(default_factory=list)
    budget_breakdown: Optional[BudgetBreakdown] = None
    place_relationships: Dict[str, List[str]] = Field(default_factory=dict)
