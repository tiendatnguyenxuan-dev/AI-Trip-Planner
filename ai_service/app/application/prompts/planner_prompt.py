from app.application.prompts.base_prompt import BasePrompt
from app.application.prompts.prompt_config import PromptConfig
from typing import List

class PlannerPrompt(BasePrompt):
    """
    Prompt used for generating a structured travel itinerary using only verified candidate places.
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
            temperature=0.1,
            max_tokens=4000,
            provider="default"
        )

    @property
    def required_variables(self) -> List[str]:
        return ["destination", "duration_days", "budget", "vibe", "group_type", "candidate_places"]

    @property
    def content(self) -> str:
        return """You are a travel planner AI.

Generate a realistic travel itinerary based on user preferences.

CRITICAL RULES:
- Use ONLY the provided candidate places, hotels, and restaurants listed below.
- Do NOT invent or include any fictional or other real-world attractions, hotels, or restaurants that are not in the provided candidates list.
- If there are no candidate places provided, suggest generic activities (e.g. 'Khám phá tự do', 'Đi dạo tự do') without inventing specific names.
- Be practical and geographically logical.

Candidate Places to choose from:
{candidate_places}

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
        "Lunch: ...",
        "Afternoon: ...",
        "Evening: ..."
      ]
    }}
  ]
}}"""
