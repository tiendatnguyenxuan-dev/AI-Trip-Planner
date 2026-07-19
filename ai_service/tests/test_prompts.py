import pytest
from app.application.prompts.prompt_registry import prompt_registry
from app.application.prompts.base_prompt import BasePrompt, PromptValidationError
from app.application.prompts.prompt_config import PromptConfig
from app.application.prompts.planner_prompt import PlannerPrompt

def test_prompt_rendering_success():
    prompt = prompt_registry.get_prompt("planner_prompt")
    rendered = prompt.render(
        destination="Nha Trang",
        duration_days=3,
        budget=2000000,
        vibe="chill",
        group_type="couple",
        candidate_places="Mock Attractions"
    )
    assert "Destination: Nha Trang" in rendered
    assert "Duration: 3 days" in rendered
    assert "Budget: 2000000 VND" in rendered

def test_prompt_rendering_validation_failure():
    prompt = prompt_registry.get_prompt("planner_prompt")
    with pytest.raises(PromptValidationError) as excinfo:
        # Missing destination
        prompt.render(
            duration_days=3,
            budget=2000000,
            vibe="chill",
            group_type="couple",
            candidate_places="Mock Attractions"
        )
    assert "Missing required variables" in str(excinfo.value)

def test_prompt_rendering_empty_or_null_failure():
    prompt = prompt_registry.get_prompt("planner_prompt")
    with pytest.raises(PromptValidationError) as excinfo:
        # Destination is empty string
        prompt.render(
            destination="   ",
            duration_days=3,
            budget=2000000,
            vibe="chill",
            group_type="couple",
            candidate_places="Mock Attractions"
        )
    assert "cannot be null or empty" in str(excinfo.value)

def test_registry_version_lookup():
    # Define a custom version of planner_prompt
    class PlannerPromptV11(BasePrompt):
        @property
        def name(self) -> str:
            return "planner_prompt"
        @property
        def version(self) -> str:
            return "1.1.0"
        @property
        def config(self) -> PromptConfig:
            return PromptConfig(temperature=0.3)
        @property
        def required_variables(self):
            return ["destination"]
        @property
        def content(self) -> str:
            return "Custom template for {destination}"

    # Register the custom version
    v11_prompt = PlannerPromptV11()
    prompt_registry.register_prompt(v11_prompt)

    # Fetching exact version
    retrieved_v11 = prompt_registry.get_prompt("planner_prompt", version="1.1.0")
    assert retrieved_v11.version == "1.1.0"
    assert retrieved_v11.render(destination="Hanoi") == "Custom template for Hanoi"

    # Fetching latest (should resolve to 1.1.0 since 1.1.0 > 1.0.0)
    latest = prompt_registry.get_prompt("planner_prompt")
    assert latest.version == "1.1.0"

    # Fetching older version explicitly
    old = prompt_registry.get_prompt("planner_prompt", version="1.0.0")
    assert old.version == "1.0.0"

def test_prompt_snapshot():
    # Snapshot testing for prompt content integrity
    planner = PlannerPrompt()
    expected_substring = "You are a travel planner AI."
    assert planner.content.startswith(expected_substring)
