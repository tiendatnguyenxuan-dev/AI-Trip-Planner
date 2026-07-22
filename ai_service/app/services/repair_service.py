import random
from typing import Dict, Any, List
from app.models.schemas import ItineraryResponse, CandidatePlaces

class RepairService:
    """
    Repairs invalid activities in the itinerary without regenerating the whole plan.
    """
    def repair_itinerary(
        self,
        itinerary: ItineraryResponse,
        validation_errors: List[str],
        candidate_places: CandidatePlaces
    ) -> ItineraryResponse:
        if not validation_errors:
            return itinerary

        repaired_days = []
        seen_activities = set()
        available_places = [p.name for p in candidate_places.places] if candidate_places else []

        for day_data in itinerary.days:
            new_activities = []
            for act in day_data.activities:
                norm = act.lower().strip()
                # Simple duplicate replacement logic
                if norm in seen_activities:
                    unused = [p for p in available_places if p.lower().strip() not in seen_activities]
                    if unused:
                        rep = random.choice(unused)
                        new_activities.append(f"Khám phá {rep} [LLM Repaired]")
                        seen_activities.add(rep.lower().strip())
                    else:
                        new_activities.append("Dạo chơi tự do [LLM Repaired]")
                else:
                    new_activities.append(act)
                    seen_activities.add(norm)

            repaired_days.append({
                "day": day_data.day,
                "activities": new_activities
            })

        return ItineraryResponse(days=repaired_days)
