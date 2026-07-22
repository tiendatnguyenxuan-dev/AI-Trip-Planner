import os
import json
from typing import Optional, List, Dict, Any
from app.application.providers.base_place_provider import BasePlaceProvider
from app.domain.entities.place import Place, Hotel, Restaurant, Attraction, Coordinates, Address, Metadata, Media, PriceLevel

class StaticDatasetProvider(BasePlaceProvider):
    """
    Concrete implementation of BasePlaceProvider utilizing local JSON dataset.
    Normalizes dataset entries into clean domain entities.
    """
    def __init__(self, json_file_path: str = None):
        if json_file_path is None:
            json_file_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "services", "vietnam_63_provinces.json"
            )
        self.json_file_path = json_file_path
        self._destinations = {}
        self._load_destinations()

    def _load_destinations(self):
        try:
            with open(self.json_file_path, "r", encoding="utf-8") as f:
                self._destinations = json.load(f)
        except Exception:
            self._destinations = {}

    @property
    def name(self) -> str:
        return "static"

    def _to_entity(self, item: Dict[str, Any], dest_name: str, item_type: str) -> Place:
        name = item.get("name", "Unknown")
        safe_name = "".join([c if c.isalnum() else "_" for c in name.lower()])
        place_id = f"static_{dest_name.lower()}_{item_type}_{safe_name}"
        
        lat, lon = 10.0, 106.0
        if "đà lạt" in dest_name.lower():
            lat, lon = 11.94, 108.45
        elif "nha trang" in dest_name.lower():
            lat, lon = 12.24, 109.20
        elif "vũng tàu" in dest_name.lower():
            lat, lon = 10.35, 107.08

        coords = Coordinates(latitude=lat, longitude=lon, geohash="mock_hash", viewport={})
        addr = Address(province=dest_name, district="District 1", country="Vietnam", full_address=f"{name}, {dest_name}")
        
        raw_price = item.get("price_level", "medium").lower()
        price_lvl = PriceLevel.MODERATE
        if "low" in raw_price:
            price_lvl = PriceLevel.BUDGET
        elif "high" in raw_price:
            price_lvl = PriceLevel.EXPENSIVE

        meta = Metadata(
            rating=4.5,
            review_count=100,
            provider="static",
            tags=[item.get("vibe", "general")] if item.get("vibe") else [],
            price_level=price_lvl,
            media=Media(photos=[f"https://picsum.photos/400/300?random={safe_name}"], videos=[], thumbnails=[])
        )

        if item_type == "hotel":
            return Hotel(
                place_id=place_id,
                provider="static",
                external_id=place_id,
                name=name,
                coordinates=coords,
                address=addr,
                metadata=meta,
                price_level=raw_price
            )
        elif item_type == "restaurant" or item.get("type") == "Ăn uống":
            return Restaurant(
                place_id=place_id,
                provider="static",
                external_id=place_id,
                name=name,
                coordinates=coords,
                address=addr,
                metadata=meta,
                price_level=raw_price
            )
        else:
            return Attraction(
                place_id=place_id,
                provider="static",
                external_id=place_id,
                name=name,
                coordinates=coords,
                address=addr,
                metadata=meta,
                price_level=raw_price
            )

    def find_place_by_id(self, place_id: str) -> Optional[Place]:
        for dest, data in self._destinations.items():
            for p in data.get("places", []):
                ent = self._to_entity(p, dest, "place")
                if ent.place_id == place_id:
                    return ent
            for h in data.get("hotels", []):
                ent = self._to_entity(h, dest, "hotel")
                if ent.place_id == place_id:
                    return ent
        return None

    def search_places(self, query: str, destination: Optional[str] = None) -> List[Place]:
        results = []
        if destination:
            data = self._destinations.get(destination.title())
            if data:
                for p in data.get("places", []):
                    if not query or query.lower() in p.get("name", "").lower():
                        results.append(self._to_entity(p, destination, "place"))
        return results

    def search_hotels(self, destination: str) -> List[Hotel]:
        results = []
        data = self._destinations.get(destination.title())
        if data:
            for h in data.get("hotels", []):
                results.append(self._to_entity(h, destination, "hotel"))
        return results

    def search_restaurants(self, destination: str) -> List[Restaurant]:
        results = []
        data = self._destinations.get(destination.title())
        if data:
            for p in data.get("places", []):
                if p.get("type") == "Ăn uống":
                    results.append(self._to_entity(p, destination, "restaurant"))
        return results

    def destination_exists(self, destination: str) -> bool:
        return destination.title() in self._destinations
