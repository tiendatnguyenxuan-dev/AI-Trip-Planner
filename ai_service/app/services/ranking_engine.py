from typing import List, Optional, Dict, Any
from app.domain.entities.place import Place, PriceLevel

class RankingEngine:
    """
    Computes scores for Place candidates using configurable weights.
    """
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or {
            "rating": 1.0,
            "popularity": 0.5,
            "budget_match": 1.5,
            "tag_match": 2.0,
        }

    def rank(
        self,
        places: List[Place],
        preferred_tags: Optional[List[str]] = None,
        budget: Optional[int] = None
    ) -> List[Place]:
        """
        Scores and sorts the list of places.
        """
        scored_places = []
        preferred_tags = [t.lower() for t in (preferred_tags or [])]

        for p in places:
            score = 0.0
            meta = p.metadata
            
            if meta:
                # 1. Rating Score (out of 5.0)
                rating = meta.rating or 0.0
                score += self.weights.get("rating", 1.0) * (rating / 5.0)
                
                # 2. Popularity Score (review_count / 1000 maxed to 1.0)
                reviews = meta.review_count or 0
                pop_score = min(1.0, reviews / 1000.0)
                score += self.weights.get("popularity", 0.5) * pop_score
                
                # 3. Budget Match Score
                if budget is not None and meta.price_level:
                    score += self.weights.get("budget_match", 1.5) * 1.0
                
                # 4. Tag Match Score
                if preferred_tags:
                    tags = [t.lower() for t in meta.tags]
                    matches = sum(1 for t in preferred_tags if t in tags)
                    tag_score = matches / len(preferred_tags) if len(preferred_tags) > 0 else 0.0
                    score += self.weights.get("tag_match", 2.0) * tag_score

            # Store the computed score dynamically for explainability
            setattr(p, "_score", score)
            scored_places.append((score, p))

        # Sort by score descending
        scored_places.sort(key=lambda x: x[0], reverse=True)
        return [p for score, p in scored_places]
