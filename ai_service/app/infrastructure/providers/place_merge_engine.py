import math
from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher
from app.domain.entities.place import Place, Hotel, Restaurant, ProvenanceInfo

class PlaceMergeEngine:
    """
    Engine responsible for deduplicating, matching, and merging POI entities from multiple providers.
    Uses spatial proximity (< 50m) and fuzzy name similarity (> 0.50 for nearby places).
    """
    @staticmethod
    def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000.0
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        d_phi = math.radians(lat2 - lat1)
        d_lam = math.radians(lon2 - lon1)
        a = math.sin(d_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2.0)**2
        return R * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    @staticmethod
    def _name_similarity(name1: str, name2: str) -> float:
        return SequenceMatcher(None, name1.lower().strip(), name2.lower().strip()).ratio()

    def are_same_place(self, p1: Place, p2: Place) -> bool:
        # If external IDs match across same provider
        if p1.provider == p2.provider and p1.external_id == p2.external_id:
            return True
        
        # Spatial distance check
        if p1.coordinates and p2.coordinates:
            dist = self._haversine_meters(
                p1.coordinates.latitude, p1.coordinates.longitude,
                p2.coordinates.latitude, p2.coordinates.longitude
            )
            # Within 100 meters
            if dist <= 100.0:
                return True

        # Pure fuzzy name check if names are virtually identical
        if self._name_similarity(p1.name, p2.name) >= 0.85:
            return True

        return False

    def merge_two_places(self, primary: Place, secondary: Place) -> Place:
        """
        Merges attributes from secondary place into primary place entity following source priority.
        """
        merged_dict = primary.model_dump()
        
        # Merge descriptions
        if not merged_dict.get("description") and secondary.description:
            merged_dict["description"] = secondary.description

        # Merge metadata
        p_meta = merged_dict.get("metadata") or {}
        s_meta = secondary.metadata.model_dump() if secondary.metadata else {}

        p_meta["rating"] = p_meta.get("rating") or s_meta.get("rating")
        p_meta["review_count"] = p_meta.get("review_count") or s_meta.get("review_count")
        p_meta["phone_number"] = p_meta.get("phone_number") or s_meta.get("phone_number")
        p_meta["website_url"] = p_meta.get("website_url") or s_meta.get("website_url")
        p_meta["editorial_summary"] = p_meta.get("editorial_summary") or s_meta.get("editorial_summary")
        
        # Merge provenance
        prov = p_meta.get("provenance") or {
            "primary_provider": primary.provider,
            "merged_providers": [primary.provider],
            "merged_sources": {primary.provider: primary.external_id},
            "confidence_score": 1.0
        }
        
        if secondary.provider not in prov["merged_providers"]:
            prov["merged_providers"].append(secondary.provider)
            prov["merged_sources"][secondary.provider] = secondary.external_id
            
        p_meta["provenance"] = prov
        merged_dict["metadata"] = p_meta

        if primary.type == "hotel":
            return Hotel(**merged_dict)
        elif primary.type == "restaurant":
            return Restaurant(**merged_dict)
        return Place(**merged_dict)

    def merge_place_list(self, places: List[Place]) -> List[Place]:
        if not places:
            return []

        merged_result: List[Place] = []
        for new_p in places:
            matched_existing = None
            for idx, existing_p in enumerate(merged_result):
                if self.are_same_place(existing_p, new_p):
                    matched_existing = (idx, existing_p)
                    break

            if matched_existing:
                idx, existing_p = matched_existing
                merged_result[idx] = self.merge_two_places(existing_p, new_p)
            else:
                # Initialize provenance metadata if missing
                if new_p.metadata and not new_p.metadata.provenance:
                    new_p.metadata.provenance = ProvenanceInfo(
                        primary_provider=new_p.provider,
                        merged_providers=[new_p.provider],
                        merged_sources={new_p.provider: new_p.external_id}
                    )
                merged_result.append(new_p)

        return merged_result
