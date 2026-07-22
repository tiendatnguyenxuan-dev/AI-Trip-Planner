from typing import Optional, List
from app.application.providers.base_place_provider import BasePlaceProvider
from app.domain.entities.place import Place, Hotel, Restaurant, Attraction, Coordinates, Address, Metadata, Media, PriceLevel

class GooglePlacesProvider(BasePlaceProvider):
    """
    Mock implementation of Google Places API provider.
    """
    @property
    def name(self) -> str:
        return "google"

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        return None

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        if not destination:
            return []
        place_id = f"google_{destination.lower()}_attraction_mock"
        return [
            Attraction(
                place_id=place_id,
                provider="google",
                external_id=place_id,
                name=f"{query or 'Kỳ quan'} (Google)",
                coordinates=Coordinates(latitude=11.97, longitude=108.47),
                address=Address(province=destination, full_address=f"Google Plaza, {destination}"),
                metadata=Metadata(rating=4.9, review_count=5000, provider="google", tags=["google", "popular"]),
                price_level="high"
            )
        ]

    def search_hotels(self, destination: str) -> List[Hotel]:
        place_id = f"google_{destination.lower()}_hotel_mock"
        return [
            Hotel(
                place_id=place_id,
                provider="google",
                external_id=place_id,
                name="Google Grand Palace Resort",
                coordinates=Coordinates(latitude=11.92, longitude=108.43),
                address=Address(province=destination, full_address=f"Resort Hill, {destination}"),
                metadata=Metadata(rating=4.8, review_count=1200, provider="google", price_level=PriceLevel.ULTRA_LUXURY),
                price_level="high"
            )
        ]

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        place_id = f"google_{destination.lower()}_restaurant_mock"
        return [
            Restaurant(
                place_id=place_id,
                provider="google",
                external_id=place_id,
                name="Google Fine Dining",
                coordinates=Coordinates(latitude=11.955, longitude=108.448),
                address=Address(province=destination, full_address=f"Gourmet St, {destination}"),
                metadata=Metadata(rating=4.7, review_count=900, provider="google", price_level=PriceLevel.EXPENSIVE),
                price_level="high"
            )
        ]

    def destination_exists(self, destination: str) -> bool:
        return True
