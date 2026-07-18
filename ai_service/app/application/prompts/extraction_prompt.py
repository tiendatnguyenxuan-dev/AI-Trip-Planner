from app.application.prompts.base_prompt import BasePrompt

class ExtractionPrompt(BasePrompt):
    """
    Prompt used for direct entity extraction from natural language.
    """
    @property
    def name(self) -> str:
        return "extraction_prompt"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def temperature(self) -> float:
        return 0.1

    @property
    def max_tokens(self) -> int:
        return 1000

    @property
    def provider(self) -> str:
        return "default"

    @property
    def content(self) -> str:
        return """Trích xuất các thông tin du lịch từ văn bản sau dưới dạng JSON:
Văn bản: "{text}"
Hãy trích xuất các trường: destination, budget, duration_days, vibe, group_type, travelers, origin."""
