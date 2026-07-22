from typing import Optional, List
from app.application.providers.base_place_provider import BasePlaceProvider
from app.domain.entities.place import Place, Hotel, Restaurant, Attraction, Coordinates, Address, Metadata, Media, PriceLevel

class OpenStreetMapProvider(BasePlaceProvider):
    """
    Mock implementation of OpenStreetMap provider utilizing Overpass API schema.
    """
    @property
    def name(self) -> str:
        return "osm"

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        return None

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        # Return mock OSM attraction matching query
        if not destination:
            return []
        place_id = f"osm_{destination.lower()}_attraction_mock"
        return [
            Attraction(
                place_id=place_id,
                provider="osm",
                external_id=place_id,
                name=f"{query or 'Điểm du lịch'} (OSM)",
                coordinates=Coordinates(latitude=11.95, longitude=108.46),
                address=Address(province=destination, full_address=f"OSM Road, {destination}"),
                metadata=Metadata(rating=4.2, review_count=50, provider="osm", tags=["osm", "scenic"]),
                price_level="medium"
            )
        ]

    def search_hotels(self, destination: str) -> List[Hotel]:
        place_id = f"osm_{destination.lower()}_hotel_mock"
        return [
            Hotel(
                place_id=place_id,
                provider="osm",
                external_id=place_id,
                name="OSM Cozy Stay",
                coordinates=Coordinates(latitude=11.93, longitude=108.44),
                address=Address(province=destination, full_address=f"OSM Hotel St, {destination}"),
                metadata=Metadata(rating=4.0, review_count=30, provider="osm", price_level=PriceLevel.MODERATE),
                price_level="medium"
            )
        ]

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        place_id = f"osm_{destination.lower()}_restaurant_mock"
        return [
            Restaurant(
                place_id=place_id,
                provider="osm",
                external_id=place_id,
                name="OSM Street Food",
                coordinates=Coordinates(latitude=11.96, longitude=108.45),
                address=Address(province=destination, full_address=f"OSM Food Lane, {destination}"),
                metadata=Metadata(rating=4.4, review_count=80, provider="osm", price_level=PriceLevel.BUDGET),
                price_level="low"
            )
        ]

    def destination_exists(self, destination: str) -> bool:
        return True
