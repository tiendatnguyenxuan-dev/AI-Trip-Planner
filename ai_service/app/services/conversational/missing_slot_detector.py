from typing import Optional, List, Tuple
from app.models.conversational_schemas import TripDraft

class MissingSlotDetector:
    """
    Evaluates TripDraft against required and optional slot rules to determine:
    1. Known slots vs Missing slots.
    2. Highest priority missing slot to ask next.
    3. Completeness score.
    """

    PRIORITY_REQUIRED_SLOTS = ["destination", "duration_days", "budget", "group_type"]
    OPTIONAL_SLOTS = ["start_date", "travel_style", "food_preference", "hotel_preference"]

    def detect_next_slot(self, draft: TripDraft) -> Optional[str]:
        # Check required slots in order of priority
        for slot_name in self.PRIORITY_REQUIRED_SLOTS:
            slot_val = getattr(draft, slot_name, None)
            if slot_val is None or slot_val.value is None:
                return slot_name
        
        # Check optional slots
        for slot_name in self.OPTIONAL_SLOTS:
            slot_val = getattr(draft, slot_name, None)
            if slot_val is None or slot_val.value is None:
                return slot_name
                
        return None

    def is_planning_ready(self, draft: TripDraft) -> bool:
        """
        Planning is ready when all required core slots are filled.
        """
        for slot_name in self.PRIORITY_REQUIRED_SLOTS:
            slot_val = getattr(draft, slot_name, None)
            if slot_val is None or slot_val.value is None:
                return False
        return True
