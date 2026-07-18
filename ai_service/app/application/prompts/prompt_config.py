from pydantic import BaseModel

class PromptConfig(BaseModel):
    """
    Configuration parameters for prompt execution.
    """
    temperature: float = 0.2
    max_tokens: int = 2000
    provider: str = "default"
