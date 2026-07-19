from typing import List
from app.domain.entities.place import Media

class BaseMediaProvider:
    """
    Abstract port for retrieving media assets from stock platforms.
    """
    def get_photos(self, query: str) -> List[str]:
        return []

class UnsplashMediaProvider(BaseMediaProvider):
    """
    Adapter implementing Unsplash photo queries.
    """
    def get_photos(self, query: str) -> List[str]:
        clean = "".join([c if c.isalnum() else "_" for c in query.lower()])
        return [
            f"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80&rand={clean}"
        ]

class PexelsMediaProvider(BaseMediaProvider):
    """
    Adapter implementing Pexels queries.
    """
    def get_photos(self, query: str) -> List[str]:
        return []

class MediaService:
    """
    Coordinates photo/video retrieval for locations using registered media providers.
    """
    def __init__(self, provider: BaseMediaProvider = None):
        self.provider = provider or UnsplashMediaProvider()

    def get_media_for_place(self, name: str) -> Media:
        photos = self.provider.get_photos(name)
        return Media(
            photos=photos,
            videos=[],
            thumbnails=photos[:1] if photos else []
        )
