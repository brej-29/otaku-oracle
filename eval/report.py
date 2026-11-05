"""Response coverage, stratified cluster bootstrap and paired comparisons."""

import json
import random
from collections import defaultdict
from pathlib import Path
from statistics import mean

from .dataset import SEED, fingerprint
from .network import write_json
from .scoring import score


def interval(rows, field, replicates=10000, model_equal=False):
    if not rows:
        return None
    clusters = defaultdict(lambda: defaultdict(list))
    for row in rows:
        clusters[row["bucket"]][row["media_id"]].append((row.get("model", "single"), row[field]))
    # Preserve the question-weighted ratio when titles have missing question types.
    strata = []
    for titles in clusters.values():
        totals = []
        for values in titles.values():
            models = defaultdict(list)
            for model, value in values:
                models[model].append(value)
            totals.append({m: (sum(v), len(v)) for m, v in models.items()})
        strata.append(totals)
    rng = random.Random(SEED)
    samples = []
    for _ in range(replicates):
        totals = defaultdict(lambda: [0, 0])
        for titles in strata:
            for _ in titles:
                for model, (total, count) in rng.choice(titles).items():
                    totals[model][0] += total
                    totals[model][1] += count
        samples.append(mean(total / count for total, count in totals.values()) if model_equal else
                       sum(total for total, count in totals.values()) / sum(count for total, count in totals.values()))
    samples.sort()
    # Inverse empirical CDF percentile endpoints (fixed in implementation).
    return [samples[int(.025 * (replicates - 1))], samples[int(.975 * (replicates - 1))]]


def summarize(rows, expected):
    responses = [r for r in rows if r["status"] == "ok"]
    n = len(responses)
    citations = sum(r["citations"] for r in responses)
    return {"expected": expected, "attempted": len(rows), "responses": n, "errors": len(rows) - n,
            "coverage": n / expected if expected else None,
            **{key: mean(r[key] for r in responses) if n else None for key in
               ("correct", "abstention", "hallucination", "wrong_answer", "parse_failure", "missing_confidence", "correct_with_citation")},
            "citation_validity": sum(r["valid_citations"] for r in responses) / citations if citations else None,
            "citation_count": citations, "accuracy_ci95": interval(responses, "correct")}


def pairs(rows):
    grouped = defaultdict(dict)
    for row in rows:
        if row["status"] == "ok" and row["arm"] in ("A", "B"):
            grouped[(row["question_id"], row["model"], row["repeat"])][row["arm"]] = row
    return [{**arms["A"], "delta": int(arms["B"]["correct"]) - int(arms["A"]["correct"])}
            for arms in grouped.values() if set(arms) == {"A", "B"}]


def paired_summary(rows):
    paired = pairs(rows)
    # Average available repeats within each question/model before equal weighting.
    by_question = defaultdict(list)
    for row in paired:
        by_question[(row["question_id"], row["model"])].append(row)
    averaged = [{**values[0], "delta": mean(r["delta"] for r in values)} for values in by_question.values()]
    return {"pairs": len(paired), "questions_models": len(averaged),
            "delta": mean(mean(r["delta"] for r in averaged if r["model"] == model)
                          for model in {r["model"] for r in averaged}) if averaged else None,
            "ci95": interval(averaged, "delta", model_equal=True)}


def percent(value):
    return "N/A" if value is None else f"{100 * value:.1f}%"


def ci(value):
    return "N/A" if value is None else f"[{percent(value[0])}, {percent(value[1])}]"


def report(dataset, directory):
    directory = Path(directory)
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    if manifest["dataset_sha256"] != fingerprint(dataset):
        raise ValueError("Result manifest does not match dataset")
    questions = {q["id"]: q for q in dataset["questions"]}
    journal = [json.loads(s) for s in (directory / "answers.jsonl").read_text(encoding="utf-8").splitlines()]
    # Retain failed attempts in the journal, score only the latest observation on resume.
    rows = list({(r["question_id"], r["model"], r["arm"], r["repeat"]): r for r in journal}.values())
    for row in rows:
        if row["status"] == "ok":
            row.update(score(questions[row["question_id"]], row.get("content")))
    groups = {}
    for model in manifest["models"] + ["deterministic"]:
        for arm in (["C"] if model == "deterministic" else ["A", "B"]):
            for dimension in ("all", "bucket", "kind"):
                values = ["all"] if dimension == "all" else sorted({q[dimension] for q in questions.values()})
                for value in values:
                    subset = [r for r in rows if r["model"] == model and r["arm"] == arm and (dimension == "all" or r[dimension] == value)]
                    count = sum(dimension == "all" or q[dimension] == value for q in questions.values())
                    key = f"{model}|{arm}|{dimension}:{value}"
                    groups[key] = summarize(subset, count * (1 if arm == "C" else 3))
    paired = {}
    for model in manifest["models"] + ["pooled"]:
        for bucket in ["all"] + sorted({q["bucket"] for q in questions.values()}):
            subset = [r for r in rows if (model == "pooled" or r["model"] == model) and (bucket == "all" or r["bucket"] == bucket)]
            paired[f"{model}|{bucket}"] = paired_summary(subset)
    completion = json.loads((directory / "completion.json").read_text(encoding="utf-8"))
    credential_blocked = any(any(a.get("status") == 401 for a in r.get("attempts", [])) for r in rows if r["status"] != "ok")
    result = {"dataset_sha256": manifest["dataset_sha256"], "title_count": len(dataset["titles"]),
              "journal_entries": len(journal), "historical_error_entries": sum(r["status"] != "ok" for r in journal),
              "question_count": len(questions), "groups": groups, "paired": paired, "completion": completion,
              "interpretation": "Completed run; assess preregistered thresholds" if completion["complete"] else
              "BLOCKED: invalid provider credential (HTTP 401); model results unavailable; hypothesis threshold cannot pass" if credential_blocked else
              "Incomplete: descriptive observed-response scores only; hypothesis threshold cannot pass; missingness may be biased"}
    write_json(directory / "summary.json", result)
    lines = ["# Measured baseline", "", result["interpretation"], "",
             f"Titles: {len(dataset['titles'])}; questions: {len(questions)}; repeats planned: 3; clustered bootstrap: 10,000, seed {SEED}.", "",
             "| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |",
             "|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|"]
    for key, value in groups.items():
        if not key.endswith("|all:all"):
            continue
        model, arm, _ = key.split("|")
        lines.append(f"| {model} | {arm} | {value['responses']} / {value['expected']} | {value['attempted']} | {percent(value['correct'])} {ci(value['accuracy_ci95'])} | " +
                     " | ".join(percent(value[k]) for k in ("abstention", "hallucination", "wrong_answer", "parse_failure", "missing_confidence", "citation_validity", "correct_with_citation")) + " |")
    lines += ["", "A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).",
              "Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.", "",
              "| Model / bucket | Complete pairs | B minus A | 95% CI |", "|---|---:|---:|---|"]
    for key, value in paired.items():
        lines.append(f"| {key} | {value['pairs']} | {percent(value['delta'])} | {ci(value['ci95'])} |")
    for dimension in ("bucket", "kind"):
        lines += ["", f"## Accuracy by {dimension}", "", "| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) |", "|---|---|---|---:|---|"]
        for key, value in groups.items():
            model, arm, label = key.split("|")
            if label.startswith(dimension + ":"):
                lines.append(f"| {model} | {arm} | {label.split(':')[1]} | {value['responses']} / {value['expected']} | {percent(value['correct'])} {ci(value['accuracy_ci95'])} |")
    (directory / "summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return result
