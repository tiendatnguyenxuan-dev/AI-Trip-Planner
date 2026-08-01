import logging
from typing import List, Dict, Any
from app.models.discovery_schemas import (
    DestinationInfo,
    MapContext,
    MapMarker,
    WeatherInfo,
    DestinationDiscoveryContext
)
from app.services.discovery.destination_resolver import DestinationResolver
from app.services.media.media_discovery_service import MediaDiscoveryService
from app.services.media.media_ranking_engine import MediaRankingEngine

logger = logging.getLogger(__name__)

class DestinationDiscoveryService:
    """
    Orchestrates interactive destination discovery, map context creation, POIs, weather, and social media discovery.
    """

    def __init__(self):
        self.resolver = DestinationResolver()
        self.media_discovery_service = MediaDiscoveryService()
        self.media_ranking_engine = MediaRankingEngine()

    def discover(self, query: str) -> DestinationDiscoveryContext:
        # 1. Resolve Destination
        dest: DestinationInfo = self.resolver.resolve(query)
        
        # 2. Discover & Rank Social Media Items (Phase 8)
        raw_media = self.media_discovery_service.discover_media(dest.canonical_name, limit=10)
        ranked_media = self.media_ranking_engine.rank(raw_media, dest.canonical_name, top_n=5)

        # 3. Create Sample POIs & Map Markers
        pois = [
            {
                "id": f"poi_1_{dest.destination_id}",
                "name": f"Bãi biển {dest.canonical_name}",
                "type": "ATTRACTION",
                "lat": dest.lat + 0.008,
                "lng": dest.lng + 0.012,
                "rating": 4.8,
                "category": "Beach & Nature",
                "description": "Bãi biển tuyệt đẹp với nước trong xanh và không khí trong lành."
            },
            {
                "id": f"poi_2_{dest.destination_id}",
                "name": f"Nhà hàng Hải sản {dest.canonical_name}",
                "type": "RESTAURANT",
                "lat": dest.lat - 0.006,
                "lng": dest.lng - 0.004,
                "rating": 4.7,
                "category": "Food & Dining",
                "description": "Chuyên phục vụ các món hải sản tươi sống đặc sản địa phương."
            },
            {
                "id": f"poi_3_{dest.destination_id}",
                "name": f"Resort & Spa {dest.canonical_name}",
                "type": "HOTEL",
                "lat": dest.lat + 0.012,
                "lng": dest.lng - 0.008,
                "rating": 4.9,
                "category": "Luxury Hotel",
                "description": "Khu nghỉ dưỡng 5 sao yên tĩnh hướng biển."
            }
        ]

        # 4. Generate Map Context Markers
        markers: List[MapMarker] = []
        for p in pois:
            markers.append(MapMarker(
                id=p["id"],
                title=p["name"],
                type=p["type"],
                lat=p["lat"],
                lng=p["lng"],
                rating=p["rating"],
                category=p["category"]
            ))

        for m in ranked_media:
            markers.append(MapMarker(
                id=m.id,
                title=m.title,
                type="MEDIA",
                lat=dest.lat + 0.004,
                lng=dest.lng + 0.004,
                thumbnail=m.thumbnail_url
            ))

        map_context = MapContext(
            center={"lat": dest.lat, "lng": dest.lng},
            zoom=dest.default_zoom,
            bounds=dest.viewport,
            markers=markers
        )

        # 5. Suggestions for AI Chat
        suggestions = [
            f"Gợi ý cho tôi lịch trình {dest.canonical_name} 3 ngày 2 đêm",
            f"Các món ăn đặc sản không thể bỏ qua ở {dest.canonical_name}",
            f"Khách sạn view đẹp gần bãi biển {dest.canonical_name}"
        ]

        return DestinationDiscoveryContext(
            destination=dest,
            map_context=map_context,
            pois=pois,
            media_items=ranked_media,
            weather=WeatherInfo(),
            recommendations_preview=pois[:2],
            conversation_suggestions=suggestions
        )

# Global discovery service instance
discovery_service = DestinationDiscoveryService()
