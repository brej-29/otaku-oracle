import json

import pytest

from eval.scoring import exact, score


def question(kind="episodes", gold=12):
    return {"kind": kind, "gold": gold, "citation": "https://anilist.co/anime/1"}


@pytest.mark.parametrize("answer,expected", [(12, True), (" 12 ", True), ("12 episodes", False),
    (12.0, False), (True, False), ("12.4", False), (11, False)])
def test_numeric_exactness(answer, expected):
    assert exact("episodes", answer, 12) is expected


def test_studios_are_complete_sets_not_fuzzy_matches():
    assert exact("studio", ["Toei Animation", "Studio 4°C"], ["STUDIO 4°C", "Toei-Animation"])
    assert exact("studio", ["Pokémon"], ["Pokemon"])
    assert not exact("studio", ["Toei"], ["Toei Animation"])
    assert not exact("studio", "Toei Animation", ["Toei Animation"])
    assert not exact("studio", ["A"], ["A", "B"])


def test_categorical_normalization():
    assert exact("source", "light novel", "LIGHT_NOVEL")
    assert exact("format", "tv-short", "TV_SHORT")
    assert not exact("season", "autumn", "FALL")


@pytest.mark.parametrize("answer", [None, "", []])
def test_abstention_is_incorrect_but_not_hallucination(answer):
    result = score(question(), json.dumps({"answer": answer, "confidence": 1, "citations": []}))
    assert result["abstention"] and not result["correct"] and not result["hallucination"]


@pytest.mark.parametrize("content", ["no", "[]", "{}", '```json\n{"answer":12}\n```',
    '{"answer":12,"citations":"https://anilist.co/anime/1"}'])
def test_malformed_is_parse_failure_not_abstention(content):
    result = score(question(), content)
    assert result["parse_failure"] and not result["abstention"] and not result["correct"]


def test_confident_wrong_and_exact_citation():
    result = score(question(), json.dumps({"answer": 13, "confidence": .8,
        "citations": ["https://anilist.co/anime/1", "https://anilist.co/anime/2", "https://anilist.co/anime/1/"]}))
    assert result["hallucination"] and result["wrong_answer"]
    assert result["valid_citations"] == 1 and result["citations"] == 3
    assert not result["correct_with_citation"]


@pytest.mark.parametrize("confidence", [None, True, "0.9", 2, -1, float("nan")])
def test_missing_or_invalid_confidence_is_reported(confidence):
    result = score(question(), json.dumps({"answer": 13, "confidence": confidence}))
    assert result["missing_confidence"] and result["wrong_answer"] and not result["hallucination"]
