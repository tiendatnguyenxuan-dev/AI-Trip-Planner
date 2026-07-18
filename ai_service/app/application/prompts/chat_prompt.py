from app.application.prompts.base_prompt import BasePrompt

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
    def temperature(self) -> float:
        return 0.7

    @property
    def max_tokens(self) -> int:
        return 2000

    @property
    def provider(self) -> str:
        return "default"

    @property
    def content(self) -> str:
        return "You are a helpful assistant specialized in travel and trip planning."
