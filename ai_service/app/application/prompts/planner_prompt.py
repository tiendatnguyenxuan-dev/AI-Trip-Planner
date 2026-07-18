from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.prompt_config import PromptConfig
from typing import List

class PlannerPrompt(BasePrompt):
    """
    Prompt used for generating a structured travel itinerary.
    """
    @property
    def name(self) -> str:
        return "planner_prompt"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def config(self) -> PromptConfig:
        return PromptConfig(
            temperature=0.2,
            max_tokens=4000,
            provider="default"
        )

    @property
    def required_variables(self) -> List[str]:
        return ["destination", "duration_days", "budget", "vibe", "group_type"]

    @property
    def content(self) -> str:
        return """You are a travel planner AI.

Generate a realistic travel itinerary based on user preferences.

Constraints:
- Be practical and geographically logical
- Do NOT include impossible travel distances in 1 day
- Keep activities concise
- Use real-world style suggestions

Input:

Destination: {destination}
Duration: {duration_days} days
Budget: {budget} VND
Vibe: {vibe}
Group: {group_type}

Return JSON ONLY:

{{
  "days": [
    {{
      "day": 1,
      "activities": [
        "Morning: ...",
        "Afternoon: ...",
        "Evening: ..."
      ]
    }}
  ]
}}"""
