from typing import Dict, Tuple, Optional, List
from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.planner_prompt import PlannerPrompt
from app.application.prompts.repair_prompt import RepairPrompt
from app.application.prompts.extraction_prompt import ExtractionPrompt
from app.application.prompts.chat_prompt import ChatPrompt

def semver_key(version_str: str):
    """Helper to sort semantic versions like 1.0.0, 1.2.3, etc."""
    try:
        return [int(x) for x in version_str.split(".")]
    except ValueError:
        return [0]

class PromptRegistry:
    """
    Registry for managing prompt configurations and instances.
    Supports registering multiple versions of a prompt and resolving the latest version.
    """
    def __init__(self):
        # Maps (name, version) -> BasePrompt
        self._prompts: Dict[Tuple[str, str], BasePrompt] = {}
        
        # Register default prompts
        self.register_prompt(PlannerPrompt())
        self.register_prompt(RepairPrompt())
        self.register_prompt(ExtractionPrompt())
        self.register_prompt(ChatPrompt())

    def register_prompt(self, prompt: BasePrompt) -> None:
        """Registers a prompt instance."""
        self._prompts[(prompt.name, prompt.version)] = prompt

    def get_prompt(self, name: str, version: Optional[str] = None) -> BasePrompt:
        """
        Retrieves a prompt instance by name and version.
        If version is omitted, returns the latest version based on semver.
        """
        if version:
            key = (name, version)
            if key not in self._prompts:
                raise KeyError(f"Prompt '{name}' with version '{version}' not found in registry.")
            return self._prompts[key]
        
        # If no version specified, find all versions and return the latest
        matching_prompts = [p for p in self._prompts.values() if p.name == name]
        if not matching_prompts:
            raise KeyError(f"Prompt '{name}' not found in registry.")
            
        # Sort by version using semver sorting helper
        matching_prompts.sort(key=lambda p: semver_key(p.version))
        return matching_prompts[-1]

prompt_registry = PromptRegistry()
