from app.application.prompts.base_prompt import BasePrompt

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
    def temperature(self) -> float:
        return 0.2

    @property
    def max_tokens(self) -> int:
        return 4000

    @property
    def provider(self) -> str:
        return "default"

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
