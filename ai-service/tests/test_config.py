from app.core.config import Settings
from app.llm.reasoning import split_reasoning, strip_reasoning


def test_settings_defaults():
    s = Settings(_env_file=None)
    assert s.app_name == "urban-sole-ai"
    assert s.is_production is False
    assert s.embeddings_dim == 384


def test_strip_reasoning_removes_think_block():
    raw = "<think>the user wants a greeting</think>Hello there!"
    assert strip_reasoning(raw) == "Hello there!"


def test_strip_reasoning_handles_unclosed_block():
    # Model hit the token limit mid-thought (no closing tag).
    raw = "<think>reasoning that got cut off"
    assert strip_reasoning(raw) == ""


def test_split_reasoning_returns_both_parts():
    visible, reasoning = split_reasoning("<think>plan</think>Answer.")
    assert visible == "Answer."
    assert "plan" in reasoning
