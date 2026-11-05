"""Frozen exact scoring; no fuzzy matching or model-based judgments."""

import json
import math
import re
import unicodedata


def normalize(value):
    value = unicodedata.normalize("NFKD", str(value)).casefold()
    return "".join(c for c in value if c.isalnum() and not unicodedata.combining(c))


def integer(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and re.fullmatch(r"[+-]?\d+", value.strip()):
        return int(value.strip())
    return None


def exact(kind, answer, gold):
    if kind in ("episodes", "year", "main_characters"):
        return integer(answer) is not None and integer(answer) == gold
    if kind == "studio":
        return (isinstance(answer, list) and all(isinstance(x, str) for x in answer)
                and {normalize(x) for x in answer} == {normalize(x) for x in gold})
    return isinstance(answer, str) and normalize(answer) == normalize(gold)


def score(question, content):
    failure = {"correct": False, "abstention": False, "hallucination": False, "wrong_answer": False,
               "parse_failure": True, "missing_confidence": True, "citations": 0, "valid_citations": 0,
               "correct_with_citation": False}
    try:
        data = json.loads(content)
    except (ValueError, TypeError):
        return failure
    if not isinstance(data, dict) or "answer" not in data:
        return failure
    answer = data["answer"]
    abstention = answer is None or answer == "" or answer == []
    confidence = data.get("confidence")
    has_confidence = (type(confidence) in (int, float) and math.isfinite(confidence) and 0 <= confidence <= 1)
    citations = data.get("citations", [])
    if not isinstance(citations, list) or not all(isinstance(c, str) for c in citations):
        return failure
    correct = not abstention and exact(question["kind"], answer, question["gold"])
    valid = sum(c == question["citation"] for c in citations)
    wrong = not abstention and not correct
    return {"correct": correct, "abstention": abstention, "wrong_answer": wrong,
            "hallucination": wrong and has_confidence and confidence >= .8,
            "parse_failure": False, "missing_confidence": not has_confidence,
            "citations": len(citations), "valid_citations": valid,
            "correct_with_citation": correct and valid > 0}
