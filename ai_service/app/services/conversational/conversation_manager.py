import uuid
import logging
from typing import Dict, Optional
from app.models.conversational_schemas import (
    ConversationalSession,
    ConversationState,
    ChatMessage,
    ConversationalPlanRequest,
    ConversationalPlanResponse
)
from app.services.conversational.incremental_parser import IncrementalParser
from app.services.conversational.missing_slot_detector import MissingSlotDetector
from app.services.conversational.question_generator import QuestionGenerator
from app.pipelines.trip_pipeline import trip_pipeline
from app.shared.context.trip_context import TripContext

logger = logging.getLogger(__name__)

class ConversationManager:
    """
    Manages in-memory stateful conversation sessions, coordinates incremental parsing,
    missing slot detection, question generation, and planning execution.
    """

    def __init__(self):
        self.sessions: Dict[str, ConversationalSession] = {}
        self.parser = IncrementalParser()
        self.detector = MissingSlotDetector()
        self.question_gen = QuestionGenerator()

    def get_or_create_session(self, session_id: Optional[str], user_id: Optional[str] = None) -> ConversationalSession:
        if not session_id or session_id not in self.sessions:
            new_id = session_id or str(uuid.uuid4())
            session = ConversationalSession(session_id=new_id, user_id=user_id)
            self.sessions[new_id] = session
            return session
        return self.sessions[session_id]

    async def process_message(self, request: ConversationalPlanRequest) -> ConversationalPlanResponse:
        session = self.get_or_create_session(request.session_id, request.user_id)

        # 1. Append user message
        user_msg = ChatMessage(role="user", content=request.message)
        session.history.append(user_msg)
        msg_idx = len(session.history)

        # 2. Incremental Parse -> Update TripDraft
        session.trip_draft = await self.parser.update_draft(session.trip_draft, request.message, msg_idx)

        # 3. Evaluate state & missing slots
        is_ready = self.detector.is_planning_ready(session.trip_draft)
        next_slot = self.detector.detect_next_slot(session.trip_draft)
        completeness = session.trip_draft.get_completeness_score()

        itinerary_data = None

        if is_ready:
            session.state = ConversationState.PLANNING
            
            # Formulate prompt from collected draft
            draft_summary = (
                f"Đi du lịch tại {session.trip_draft.destination.value} "
                f"trong {session.trip_draft.duration_days.value} ngày "
                f"với ngân sách {session.trip_draft.budget.value} VNĐ. "
                f"Đi nhóm {session.trip_draft.group_type.value if session.trip_draft.group_type else 'bạn bè'}."
            )
            
            try:
                context = TripContext(draft_summary, session.user_id)
                plan_result = await trip_pipeline.execute(context)
                itinerary_data = plan_result.dict()
                session.state = ConversationState.COMPLETED
                assistant_text = f"Tuyệt vời! Tôi đã lập xong lịch trình du lịch {session.trip_draft.destination.value.title()} {session.trip_draft.duration_days.value} ngày phù hợp với yêu cầu của bạn."
            except Exception as e:
                logger.error(f"Error executing trip_pipeline: {e}")
                assistant_text = f"Đã thu thập đủ thông tin chuyến đi {session.trip_draft.destination.value.title()}. Đang tiến hành tạo lịch trình..."
        else:
            session.state = ConversationState.COLLECTING_INFO
            assistant_text = self.question_gen.generate_question(next_slot, session.trip_draft)

        # 4. Append assistant response
        session.history.append(ChatMessage(role="assistant", content=assistant_text))

        # 5. Build response dict
        draft_dict = session.trip_draft.dict()

        return ConversationalPlanResponse(
            session_id=session.session_id,
            state=session.state,
            message=assistant_text,
            progress=completeness,
            trip_draft=draft_dict,
            next_missing_slot=next_slot,
            itinerary=itinerary_data
        )

# Global singleton instance
conversation_manager = ConversationManager()
