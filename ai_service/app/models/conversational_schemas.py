from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ConversationState(str, Enum):
    COLLECTING_INFO = "COLLECTING_INFO"
    CONFIRMING = "CONFIRMING"
    PLANNING = "PLANNING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class SlotSource(str, Enum):
    USER_EXPLICIT = "USER_EXPLICIT"
    INFERRED = "INFERRED"
    DEFAULT = "DEFAULT"

class SlotValue(BaseModel):
    value: Any = None
    confidence: float = 1.0
    source: SlotSource = SlotSource.USER_EXPLICIT
    msg_index: int = 0
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class TripDraft(BaseModel):
    destination: Optional[SlotValue] = None
    origin: Optional[SlotValue] = None
    budget: Optional[SlotValue] = None
    group_type: Optional[SlotValue] = None
    duration_days: Optional[SlotValue] = None
    start_date: Optional[SlotValue] = None
    end_date: Optional[SlotValue] = None
    travel_style: Optional[SlotValue] = None
    transport_preference: Optional[SlotValue] = None
    hotel_preference: Optional[SlotValue] = None
    food_preference: Optional[SlotValue] = None
    activity_preference: Optional[SlotValue] = None
    special_requests: Optional[SlotValue] = None

    def get_known_slots_count(self) -> int:
        required_keys = ["destination", "budget", "group_type", "duration_days"]
        count = 0
        for key in required_keys:
            slot = getattr(self, key, None)
            if slot and slot.value is not None:
                count += 1
        return count

    def get_completeness_score(self) -> float:
        total_required = 4
        known = self.get_known_slots_count()
        return round(known / total_required, 2)

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ConversationalSession(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    state: ConversationState = ConversationState.COLLECTING_INFO
    history: List[ChatMessage] = Field(default_factory=list)
    trip_draft: TripDraft = Field(default_factory=TripDraft)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ConversationalPlanRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    user_id: Optional[str] = None

class ConversationalPlanResponse(BaseModel):
    session_id: str
    state: ConversationState
    message: str
    progress: float
    trip_draft: Dict[str, Any]
    next_missing_slot: Optional[str] = None
    itinerary: Optional[Dict[str, Any]] = None
