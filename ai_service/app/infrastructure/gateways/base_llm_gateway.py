from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from app.application.prompts.prompt_config import PromptConfig

class BaseLLMGateway(ABC):
    """
    Abstract interface for LLM providers.
    """
    @abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Optional[str]:
        """
        Sends chat messages to the LLM provider and returns the text response content.
        """
        pass

    @abstractmethod
    async def generate_raw(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Dict[str, Any]:
        """
        Sends chat messages to the LLM provider and returns a dict with content and token metrics.
        """
        pass
