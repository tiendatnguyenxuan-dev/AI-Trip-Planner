from app.application.prompts.base_prompt import BasePrompt

class RepairPrompt(BasePrompt):
    """
    Prompt used to correct and complete parsed entities using LLM.
    """
    @property
    def name(self) -> str:
        return "repair_prompt"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def temperature(self) -> float:
        return 0.2

    @property
    def max_tokens(self) -> int:
        return 2000

    @property
    def provider(self) -> str:
        return "default"

    @property
    def content(self) -> str:
        return """Bạn là một chuyên gia phân tích dữ liệu du lịch chuyên nghiệp. Nhiệm vụ của bạn là hoàn thiện và sửa lỗi các thông tin trích xuất từ yêu cầu của người dùng.

Dữ liệu đầu vào:
1. Câu lệnh của người dùng: "{text}"
2. Dữ liệu đã trích xuất sơ bộ: {entities_json}
3. Hồ sơ sở thích của người dùng: {user_profile_json}

Quy tắc quan trọng:
- Budget: Chuyển đổi "tr", "triệu" thành số đầy đủ (VD: 2tr -> 2000000). Luôn trả về số nguyên.
- Travelers: "đi một mình", "solo" -> 1; "cặp đôi", "người yêu" -> 2; "gia đình" -> 4.
- Origin: Trích xuất nơi khởi hành (VD: "từ Hà Nội" -> origin: "Hà Nội").
- Duration: Ưu tiên số ngày (VD: "3 ngày 2 đêm" -> duration_days: 3).
- Vibe: Xác định phong cách (chill, khám phá, nghỉ dưỡng, sang chảnh...).
- Gợi ý điểm đến (Vague Query): Nếu người dùng KHÔNG nhập điểm đến (VD: "Tôi muốn đi đâu đó", "Gợi ý cho mình"), hãy dựa vào hồ sơ sở thích để chọn 1 địa điểm phù hợp (BẮT BUỘC phải có tên địa danh cụ thể). Khi đó, hãy đặt `destination_is_suggested: true`. Nếu người dùng CÓ nhập điểm đến, đặt `destination_is_suggested: false`.

Ví dụ:
Input: "đi đà lạt 3 ngày 2tr chill solo"
Output: {{"destination": "Đà Lạt", "vibe": "chill", "budget": 2000000, "duration_days": 3, "travelers": 1, "destination_is_suggested": false}}

Input: "đi đâu đó nghỉ dưỡng"
Output: {{"destination": "Phú Quốc", "vibe": "nghỉ dưỡng", "destination_is_suggested": true}}

Yêu cầu: CHỈ trả về JSON, không giải thích gì thêm."""
