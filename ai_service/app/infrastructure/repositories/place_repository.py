from typing import Optional, List
from app.application.repositories.base_place_repository import BasePlaceRepository
from app.domain.entities.place import Place, Hotel, Restaurant
from app.infrastructure.providers.provider_aggregator import ProviderAggregator
from app.infrastructure.cache.in_memory_cache import memory_cache

class PlaceRepository(BasePlaceRepository):
    """
    Concrete implementation of BasePlaceRepository wrapping ProviderAggregator and ProviderCache.
    Supports backward compatibility with providers list initialization.
    """
    def __init__(self, aggregator: Optional[ProviderAggregator] = None, providers: Optional[List] = None, cache=None):
        if aggregator is None and providers is not None:
            aggregator = ProviderAggregator(providers=providers)
        elif aggregator is None:
            from app.infrastructure.providers.static_dataset_provider import StaticDatasetProvider
            aggregator = ProviderAggregator(providers=[StaticDatasetProvider()])

        self.aggregator = aggregator
        self.cache = cache or memory_cache

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        cache_key = f"place:id:{place_id}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        place = self.aggregator.find_place_by_id(place_id)
        if place:
            self.cache.set(cache_key, place, ttl_seconds=600)
        return place

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        cache_key = f"place:search:{destination}:{query}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        places = self.aggregator.search_places(query, destination)
        self.cache.set(cache_key, places, ttl_seconds=300)
        return places

    def search_hotels(self, destination: str) -> List[Hotel]:
        cache_key = f"hotel:search:{destination}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        hotels = self.aggregator.search_hotels(destination)
        self.cache.set(cache_key, hotels, ttl_seconds=300)
        return hotels

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        cache_key = f"restaurant:search:{destination}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached

        rests = self.aggregator.search_restaurants(destination)
        self.cache.set(cache_key, rests, ttl_seconds=300)
        return rests

    def destination_exists(self, destination: str) -> bool:
        return self.aggregator.destination_exists(destination)
