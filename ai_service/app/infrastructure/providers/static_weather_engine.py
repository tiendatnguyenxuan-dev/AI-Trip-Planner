import logging
from typing import List, Optional
from app.domain.interfaces.weather_engine_interface import IWeatherEngine
from app.domain.entities.travel_intelligence import WeatherReport, WeatherCondition, DestinationEntity

logger = logging.getLogger(__name__)

class StaticWeatherEngine(IWeatherEngine):
    """
    Static/Mock weather forecast provider returning reasonable defaults for destinations.
    """
    async def get_forecast(self, destination: DestinationEntity, start_date: Optional[str] = None, days: int = 3) -> List[WeatherReport]:
        reports = []
        for d in range(days):
            reports.append(WeatherReport(
                date=f"Day {d+1}",
                condition=WeatherCondition.CLEAR if d % 2 == 0 else WeatherCondition.CLOUDY,
                temp_celsius_min=22.0,
                temp_celsius_max=30.0,
                precipitation_probability=15.0 if d % 2 == 0 else 30.0,
                is_suitable_for_outdoor=True
            ))
        return reports
