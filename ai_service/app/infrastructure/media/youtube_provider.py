import logging
import urllib.request
import urllib.parse
import json
import os
from typing import List
from app.domain.media.base_provider import BaseMediaProvider
from app.domain.media.media_item import MediaItem

logger = logging.getLogger(__name__)

class YoutubeMediaProvider(BaseMediaProvider):
    """
    Infrastructure implementation of YoutubeMediaProvider using YouTube Data API v3.
    """

    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY", "")

    def search(self, destination: str, limit: int = 10) -> List[MediaItem]:
        items: List[MediaItem] = []
        queries = [
            f"{destination} travel",
            f"{destination} review",
            f"{destination} food",
            f"{destination} attractions"
        ]

        if self.api_key:
            try:
                for q in queries[:2]:  # Query YouTube Data API
                    encoded_q = urllib.parse.quote(q)
                    url = (
                        f"https://www.googleapis.com/youtube/v3/search?"
                        f"part=snippet&q={encoded_q}&type=video&maxResults={limit // 2}&key={self.api_key}"
                    )
                    req = urllib.request.Request(url, headers={'User-Agent': 'AI-Trip-Planner/1.0'})
                    with urllib.request.urlopen(req, timeout=4) as resp:
                        res = json.loads(resp.read().decode('utf-8'))
                        for yt_item in res.get('items', []):
                            snippet = yt_item.get('snippet', {})
                            video_id = yt_item.get('id', {}).get('videoId', '')
                            if not video_id:
                                continue

                            items.append(MediaItem(
                                id=f"yt_{video_id}",
                                provider="youtube",
                                title=snippet.get('title', f"Du lịch {destination}"),
                                creator=snippet.get('channelTitle', "Travel Vlog"),
                                thumbnail_url=snippet.get('thumbnails', {}).get('high', {}).get('url', f"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"),
                                media_url=f"https://www.youtube.com/watch?v={video_id}",
                                description=snippet.get('description', ''),
                                published_at=snippet.get('publishedAt', None),
                                duration_seconds=360,
                                popularity_score=0.9,
                                related_destination=destination,
                                tags=["Travel", "Vlog", destination]
                            ))
            except Exception as e:
                logger.warn(f"YouTube Data API error or quota limit: {e}. Utilizing fallback normalization.")

        # Fallback normalization when API key is unconfigured or limit reached
        if not items:
            items = [
                MediaItem(
                    id=f"yt_fallback_1_{destination.lower().replace(' ', '_')}",
                    provider="youtube",
                    title=f"Kinh nghiệm du lịch {destination} tự túc từ A-Z | Review chi tiết 2026",
                    creator="Traveler Vietnam",
                    thumbnail_url="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                    media_url="https://www.youtube.com/watch?v=demo_yt_1",
                    description=f"Hướng dẫn di chuyển, ăn uống và vui chơi trọn gói tại {destination}.",
                    published_at="2026-01-15T10:00:00Z",
                    duration_seconds=480,
                    popularity_score=0.95,
                    related_destination=destination,
                    tags=["Du lịch", "Vlog", destination]
                ),
                MediaItem(
                    id=f"yt_fallback_2_{destination.lower().replace(' ', '_')}",
                    provider="youtube",
                    title=f"Top 10 món ngon & quán ăn nổi tiếng nhất ở {destination}",
                    creator="Foodie Channel",
                    thumbnail_url="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600",
                    media_url="https://www.youtube.com/watch?v=demo_yt_2",
                    description=f"Khám phá thiên đường ẩm thực và các món đặc sản hấp dẫn tại {destination}.",
                    published_at="2026-02-01T14:30:00Z",
                    duration_seconds=320,
                    popularity_score=0.88,
                    related_destination=destination,
                    tags=["Ẩm thực", "Food Review", destination]
                ),
                MediaItem(
                    id=f"yt_fallback_3_{destination.lower().replace(' ', '_')}",
                    provider="youtube",
                    title=f"Gợi ý 5 địa điểm check-in sống ảo cực đẹp tại {destination}",
                    creator="CheckIn Vietnam",
                    thumbnail_url="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600",
                    media_url="https://www.youtube.com/watch?v=demo_yt_3",
                    description=f"Những tọa độ sống ảo view đỉnh chóp không thể bỏ qua khi tới {destination}.",
                    published_at="2026-02-10T09:15:00Z",
                    duration_seconds=260,
                    popularity_score=0.85,
                    related_destination=destination,
                    tags=["Checkin", "Sống ảo", destination]
                )
            ]

        return items[:limit]
