from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.prompt_config import PromptConfig
from typing import List

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
    def config(self) -> PromptConfig:
        return PromptConfig(
            temperature=0.1,
            max_tokens=1000,
            provider="default"
        )

    @property
    def required_variables(self) -> List[str]:
        return ["text"]

    @property
    def content(self) -> str:
        return """Trích xuất các thông tin du lịch từ văn bản sau dưới dạng JSON:
Văn bản: "{text}"
Hãy trích xuất các trường: destination, budget, duration_days, vibe, group_type, travelers, origin."""
