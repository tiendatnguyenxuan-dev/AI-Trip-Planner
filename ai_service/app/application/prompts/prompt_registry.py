from typing import Dict
from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.planner_prompt import PlannerPrompt
from app.application.prompts.repair_prompt import RepairPrompt
from app.application.prompts.extraction_prompt import ExtractionPrompt
from app.application.prompts.chat_prompt import ChatPrompt

class PromptRegistry:
    """
    Registry for managing prompt configurations and instances.
    Allows easy retrieval and hot-swapping of prompts.
    """
    def __init__(self):
        self._prompts: Dict[str, BasePrompt] = {
            "planner_prompt": PlannerPrompt(),
            "repair_prompt": RepairPrompt(),
            "extraction_prompt": ExtractionPrompt(),
            "chat_prompt": ChatPrompt()
        }

    def get_prompt(self, name: str) -> BasePrompt:
        """Retrieves a prompt instance by name."""
        if name not in self._prompts:
            raise KeyError(f"Prompt '{name}' not found in registry.")
        return self._prompts[name]

    def register_prompt(self, prompt: BasePrompt) -> None:
        """Dynamically registers or updates a prompt in the registry."""
        self._prompts[prompt.name] = prompt

prompt_registry = PromptRegistry()
