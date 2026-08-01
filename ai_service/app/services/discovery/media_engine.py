import logging
from typing import List
from app.models.discovery_schemas import MediaItem, DestinationInfo

logger = logging.getLogger(__name__)

class BaseMediaProvider:
    """
    Abstract interface for travel media providers (YouTube, TikTok, Unsplash).
    """
    def fetch_media(self, dest: DestinationInfo) -> List[MediaItem]:
        raise NotImplementedError

class YoutubeMediaProvider(BaseMediaProvider):
    """
    Provider fetching travel video media.
    """
    def fetch_media(self, dest: DestinationInfo) -> List[MediaItem]:
        dest_name = dest.canonical_name
        lat, lng = dest.lat, dest.lng
        
        return [
            MediaItem(
                id=f"yt_1_{dest.destination_id}",
                title=f"Kinh nghiệm du lịch {dest_name} tự túc cực chill 2026",
                creator="TravelVlog VN",
                provider="youtube",
                thumbnail="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                video_url="https://www.youtube.com/watch?v=demo1",
                duration_seconds=420,
                lat=lat + 0.005,
                lng=lng + 0.005,
                tags=["Travel", "Vlog", dest_name],
                popularity_score=0.95
            ),
            MediaItem(
                id=f"yt_2_{dest.destination_id}",
                title=f"Top 10 địa điểm sống ảo & ăn uống HOT tại {dest_name}",
                creator="Foodie Guide",
                provider="youtube",
                thumbnail="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600",
                video_url="https://www.youtube.com/watch?v=demo2",
                duration_seconds=300,
                lat=lat - 0.005,
                lng=lng - 0.005,
                tags=["Food", "Checkin", dest_name],
                popularity_score=0.88
            )
        ]

class MediaEngine:
    """
    Aggregates and ranks travel media from multiple providers.
    """
    def __init__(self):
        self.providers: List[BaseMediaProvider] = [YoutubeMediaProvider()]

    def discover_media(self, dest: DestinationInfo) -> List[MediaItem]:
        all_media: List[MediaItem] = []
        for provider in self.providers:
            try:
                media_items = provider.fetch_media(dest)
                all_media.extend(media_items)
            except Exception as e:
                logger.error(f"Error fetching media from provider {provider}: {e}")

        # Rank media items by popularity score
        all_media.sort(key=lambda m: m.popularity_score, reverse=True)
        return all_media
