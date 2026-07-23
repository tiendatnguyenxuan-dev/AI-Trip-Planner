import asyncio
import logging
from typing import List, Optional
from app.application.providers.base_place_provider import BasePlaceProvider
from app.domain.entities.place import Place, Hotel, Restaurant
from app.infrastructure.providers.place_merge_engine import PlaceMergeEngine

logger = logging.getLogger(__name__)

class ProviderAggregator(BasePlaceProvider):
    """
    Aggregates POI responses from multiple providers, normalizes payloads, and merges duplicate entities using PlaceMergeEngine.
    """
    def __init__(self, providers: List[BasePlaceProvider], merge_engine: Optional[PlaceMergeEngine] = None):
        self.providers = providers
        self.merge_engine = merge_engine or PlaceMergeEngine()

    @property
    def name(self) -> str:
        return "aggregator"

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        for provider in self.providers:
            place = provider.find_place_by_id(place_id)
            if place:
                return place
        return None

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        collected = []
        for provider in self.providers:
            try:
                places = provider.search_places(query, destination)
                collected.extend(places)
            except Exception as e:
                logger.error(f"Error querying provider {provider.name}: {e}")
        return self.merge_engine.merge_place_list(collected)

    def search_hotels(self, destination: str) -> List[Hotel]:
        collected = []
        for provider in self.providers:
            try:
                hotels = provider.search_hotels(destination)
                collected.extend(hotels)
            except Exception as e:
                logger.error(f"Error querying provider {provider.name}: {e}")
        merged = self.merge_engine.merge_place_list(collected)
        return [h for h in merged if isinstance(h, Hotel)]

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        collected = []
        for provider in self.providers:
            try:
                rests = provider.search_restaurants(destination)
                collected.extend(rests)
            except Exception as e:
                logger.error(f"Error querying provider {provider.name}: {e}")
        merged = self.merge_engine.merge_place_list(collected)
        return [r for r in merged if isinstance(r, Restaurant)]

    def destination_exists(self, destination: str) -> bool:
        for provider in self.providers:
            if provider.destination_exists(destination):
                return True
        return False
