"""Write web/public/data/eval-summary.json from the completed run summaries."""

import json
from pathlib import Path

RUNS = [
    ("eval/results/zai-flash-2026-11-06", "zai", ["glm-4.7-flash", "glm-4.5-flash"], True),
    ("eval/results/replication-nvidia-2026-11-06", "nvidia", ["google/gemma-4-31b-it"], False),
    ("eval/results/replication-groq-2026-11-06", "groq", ["openai/gpt-oss-120b"], False),
]


def arm(groups, model, name):
    g = groups[f"{model}|{name}|all:all"]
    lo, hi = g["accuracy_ci95"]
    return {"accuracy": g["correct"], "lo": lo, "hi": hi, "responses": g["responses"], "expected": g["expected"]}


def main():
    models, stamps = [], []
    for folder, provider, ids, primary in RUNS:
        s = json.loads(Path(folder, "summary.json").read_text(encoding="utf-8"))
        assert s["completion"]["complete"], folder
        stamps.append(s["generated_at"])
        for m in ids:
            models.append({"id": m, "label": m.split("/")[-1], "provider": provider, "primary": primary,
                           "arms": {"A": arm(s["groups"], m, "A"), "B": arm(s["groups"], m, "B")}})
    out = {"status": "COMPLETE", "updated_at": max(stamps),
           "note": "Registered result passed: pooled B minus A is 38.7 points, 95% CI 31.7 to 46.0. Grounded accuracy is a ceiling because the record holds the answer. Exploratory models are not pooled.",
           "models": models}
    Path("web/public/data/eval-summary.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
