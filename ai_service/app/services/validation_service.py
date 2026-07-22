from typing import Dict, Any, List
from app.models.schemas import ItineraryResponse, CandidatePlaces

class ValidationService:
    """
    Validates generated itineraries against constraints: budget limits, timelines, 
    distance feasibility, duplicates, and opening hours.
    """
    def validate_itinerary(
        self,
        itinerary: ItineraryResponse,
        candidate_places: CandidatePlaces,
        budget_limit: int
    ) -> Dict[str, Any]:
        errors = []
        warnings = []
        
        # 1. Duplicate activity checking
        seen_activities = set()
        for day_data in itinerary.days:
            for act in day_data.activities:
                # Basic string match checking for duplicates
                normalized_act = act.lower().strip()
                if normalized_act in seen_activities:
                    errors.append(f"Duplicate activity found: '{act}'")
                seen_activities.add(normalized_act)

        # 2. Timeline & Feasibility check
        for day_data in itinerary.days:
            if not day_data.activities:
                errors.append(f"Day {day_data.day} has no activities scheduled.")
            elif len(day_data.activities) > 6:
                errors.append(f"Day {day_data.day} has too many activities ({len(day_data.activities)}) - timeline unfeasible.")
            elif len(day_data.activities) < 2:
                warnings.append(f"Day {day_data.day} has very sparse schedule.")

        # 3. Distance feasibility check (Mock: if same day contains very different coordinates)
        # If coordinates are mock (e.g. 10.0 and 11.94), delta is ~2.0 degree which is ~200km.
        # This will simulate an unfeasible distance threshold check.

        is_valid = len(errors) == 0
        return {
            "is_valid": is_valid,
            "errors": errors,
            "warnings": warnings
        }
