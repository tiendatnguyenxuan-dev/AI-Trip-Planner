from abc import ABC, abstractmethod

class BasePrompt(ABC):
    """
    Base interface representing a prompt template and its configuration.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """The identifier of the prompt."""
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        """The version tracking tag of the prompt."""
        pass

    @property
    @abstractmethod
    def temperature(self) -> float:
        """Preferred LLM temperature for execution."""
        pass

    @property
    @abstractmethod
    def max_tokens(self) -> int:
        """Maximum tokens for the response."""
        pass

    @property
    @abstractmethod
    def provider(self) -> str:
        """Recommended/preferred provider or model family."""
        pass

    @property
    @abstractmethod
    def content(self) -> str:
        """The raw text prompt containing place holders for formatting."""
        pass
