from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.prompt_config import PromptConfig
from typing import List

class ChatPrompt(BasePrompt):
    """
    Prompt configuration used for generic chat proxy.
    """
    @property
    def name(self) -> str:
        return "chat_prompt"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def config(self) -> PromptConfig:
        return PromptConfig(
            temperature=0.7,
            max_tokens=2000,
            provider="default"
        )

    @property
    def required_variables(self) -> List[str]:
        return []

    @property
    def content(self) -> str:
        return "You are a helpful assistant specialized in travel and trip planning."
