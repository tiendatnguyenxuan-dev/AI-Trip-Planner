from typing import Optional, List
from app.application.repositories.base_place_repository import BasePlaceRepository
from app.application.providers.base_place_provider import BasePlaceProvider
from app.domain.entities.place import Place, Hotel, Restaurant

class PlaceRepository(BasePlaceRepository):
    """
    Concrete implementation of BasePlaceRepository.
    Aggregates and merges results from multiple registered BasePlaceProviders.
    """
    def __init__(self, providers: List[BasePlaceProvider]):
        self.providers = providers

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        for provider in self.providers:
            place = provider.find_place_by_id(place_id)
            if place:
                return place
        return None

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        merged = []
        seen_ids = set()
        for provider in self.providers:
            try:
                places = provider.search_places(query, destination)
                for p in places:
                    if p.place_id not in seen_ids:
                        seen_ids.add(p.place_id)
                        merged.append(p)
            except Exception:
                pass
        return merged

    def search_hotels(self, destination: str) -> List[Hotel]:
        merged = []
        seen_ids = set()
        for provider in self.providers:
            try:
                hotels = provider.search_hotels(destination)
                for h in hotels:
                    if h.place_id not in seen_ids:
                        seen_ids.add(h.place_id)
                        merged.append(h)
            except Exception:
                pass
        return merged

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        merged = []
        seen_ids = set()
        for provider in self.providers:
            try:
                rests = provider.search_restaurants(destination)
                for r in rests:
                    if r.place_id not in seen_ids:
                        seen_ids.add(r.place_id)
                        merged.append(r)
            except Exception:
                pass
        return merged

    def destination_exists(self, destination: str) -> bool:
        for provider in self.providers:
            if provider.destination_exists(destination):
                return True
        return False
