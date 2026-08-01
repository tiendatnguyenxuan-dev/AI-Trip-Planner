import logging
from typing import List, Set
from app.domain.media.base_provider import BaseMediaProvider
from app.domain.media.media_item import MediaItem
from app.infrastructure.media.youtube_provider import YoutubeMediaProvider

logger = logging.getLogger(__name__)

class MediaDiscoveryService:
    """
    Service responsible for querying registered media providers, merging results, and removing duplicates.
    """

    def __init__(self, providers: List[BaseMediaProvider] = None):
        self.providers = providers if providers is not None else [YoutubeMediaProvider()]

    def discover_media(self, destination: str, limit: int = 10) -> List[MediaItem]:
        all_items: List[MediaItem] = []
        seen_ids: Set[str] = set()
        seen_urls: Set[str] = set()

        for provider in self.providers:
            try:
                provider_items = provider.search(destination, limit=limit)
                for item in provider_items:
                    # Deduplication check
                    if item.id not in seen_ids and item.media_url not in seen_urls:
                        seen_ids.add(item.id)
                        seen_urls.add(item.media_url)
                        all_items.append(item)
            except Exception as e:
                logger.error(f"Error querying provider {provider}: {e}")

        return all_items
