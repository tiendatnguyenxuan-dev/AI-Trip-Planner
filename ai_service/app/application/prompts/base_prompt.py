from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.application.prompts.prompt_config import PromptConfig

class PromptValidationError(ValueError):
    """Exception raised when prompt variable validation fails."""
    pass

class BasePrompt(ABC):
    """
    Base class representing a prompt template with configuration and typed variables.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """The identifier of the prompt."""
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        """The version tag of the prompt."""
        pass

    @property
    @abstractmethod
    def config(self) -> PromptConfig:
        """The configuration metadata for this prompt."""
        pass

    @property
    @abstractmethod
    def required_variables(self) -> List[str]:
        """A list of placeholder variables required for rendering."""
        pass

    @property
    @abstractmethod
    def content(self) -> str:
        """The raw text prompt containing variables in curly braces."""
        pass

    def render(self, **kwargs) -> str:
        """
        Validates provided variables and renders the prompt template.
        """
        missing = [var for var in self.required_variables if var not in kwargs]
        if missing:
            raise PromptValidationError(
                f"Validation failed for prompt '{self.name}' (version {self.version}). "
                f"Missing required variables: {missing}"
            )
        
        # Check for unexpected types or empty strings
        for var in self.required_variables:
            val = kwargs[var]
            if val is None or (isinstance(val, str) and not val.strip()):
                raise PromptValidationError(
                    f"Variable '{var}' in prompt '{self.name}' cannot be null or empty."
                )

        try:
            return self.content.format(**kwargs)
        except Exception as e:
            raise PromptValidationError(
                f"Formatting failed for prompt '{self.name}' template: {e}"
            )
