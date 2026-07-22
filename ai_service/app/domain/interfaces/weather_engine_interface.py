from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.travel_intelligence import WeatherReport, DestinationEntity

class IWeatherEngine(ABC):
    """
    Interface for fetching historical or forecasted weather conditions for travel destinations.
    """
    @abstractmethod
    async def get_forecast(self, destination: DestinationEntity, start_date: Optional[str] = None, days: int = 3) -> List[WeatherReport]:
        pass
