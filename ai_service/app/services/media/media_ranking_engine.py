import logging
from typing import List
from app.domain.media.media_item import MediaItem

logger = logging.getLogger(__name__)

class MediaRankingEngine:
    """
    Ranks MediaItem list using configurable weights: relevance, popularity, freshness, and language.
    """

    def __init__(self,
                 w_relevance: float = 0.40,
                 w_popularity: float = 0.30,
                 w_freshness: float = 0.20,
                 w_language: float = 0.10):
        self.w_relevance = w_relevance
        self.w_popularity = w_popularity
        self.w_freshness = w_freshness
        self.w_language = w_language

    def rank(self, items: List[MediaItem], destination: str, top_n: int = 5) -> List[MediaItem]:
        dest_lower = destination.lower()
        scored_items = []

        for item in items:
            # 1. Relevance Score
            title_lower = item.title.lower()
            tags_lower = [t.lower() for t in item.tags]
            is_in_title = dest_lower in title_lower
            is_in_tags = any(dest_lower in t for t in tags_lower)
            relevance_score = 1.0 if is_in_title else (0.7 if is_in_tags else 0.4)

            # 2. Popularity Score
            popularity_score = item.popularity_score

            # 3. Freshness Score (Default 0.85)
            freshness_score = 0.85

            # 4. Language Score (Check Vietnamese keywords)
            vietnamese_keywords = ["du lịch", "kinh nghiệm", "tự túc", "món ngon", "review", "đặc sản", "check-in"]
            is_vietnamese = any(kw in title_lower for kw in vietnamese_keywords)
            language_score = 1.0 if is_vietnamese else 0.6

            # Compute final composite score
            composite_score = (
                (self.w_relevance * relevance_score) +
                (self.w_popularity * popularity_score) +
                (self.w_freshness * freshness_score) +
                (self.w_language * language_score)
            )

            scored_items.append((composite_score, item))

        # Sort descending by composite score
        scored_items.sort(key=lambda pair: pair[0], reverse=True)

        ranked_result = [pair[1] for pair in scored_items[:top_n]]
        return ranked_result
