from pydantic import BaseModel, Field
from typing import Optional, List

class MediaItem(BaseModel):
    """
    Domain entity representing travel media discovered for a destination.
    """
    id: str
    provider: str  # "youtube", "tiktok", "instagram", "unsplash"
    title: str
    creator: str
    thumbnail_url: str
    media_url: str
    description: Optional[str] = ""
    published_at: Optional[str] = None
    duration_seconds: Optional[int] = 180
    popularity_score: float = 0.5
    related_destination: str
    related_place: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
