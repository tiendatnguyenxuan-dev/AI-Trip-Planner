from typing import Optional
from app.models.conversational_schemas import TripDraft

class QuestionGenerator:
    """
    Generates natural, friendly questions for missing slots.
    Ensures only ONE question is asked per turn.
    """

    SLOT_QUESTIONS = {
        "destination": "Bạn đang muốn đi du lịch ở đâu? (Ví dụ: Đà Lạt, Nha Trang, Phú Quốc...)",
        "duration_days": "Chuyến đi của bạn dự kiến kéo dài mấy ngày?",
        "budget": "Ngân sách dự kiến cho chuyến đi là khoảng bao nhiêu? (Ví dụ: 3 triệu, 5 triệu...)",
        "group_type": "Bạn sẽ đi du lịch cùng ai? (Một mình, Cặp đôi, Gia đình hay Nhóm bạn?)",
        "start_date": "Bạn dự định khởi hành vào thời gian nào?",
        "travel_style": "Bạn yêu thích phong cách chuyến đi thế nào? (Nghỉ dưỡng, Ẩm thực, Phiêu lưu, Văn hóa...)",
    }

    def generate_question(self, missing_slot: str, draft: TripDraft) -> str:
        question = self.SLOT_QUESTIONS.get(
            missing_slot,
            "Bạn có yêu cầu hay sở thích đặc biệt nào khác cho chuyến đi không?"
        )

        # Contextualize if destination is already known
        if missing_slot == "duration_days" and draft.destination and draft.destination.value:
            dest = draft.destination.value.title()
            return f"Bạn dự định khám phá {dest} trong mấy ngày?"

        if missing_slot == "budget" and draft.destination and draft.destination.value:
            dest = draft.destination.value.title()
            return f"Dự kiến ngân sách cho chuyến du lịch {dest} của bạn là bao nhiêu?"

        return question
