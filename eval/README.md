# Factual evaluation

Run from the repository root with Python >=3.11 and uv:

```powershell
uv sync --project eval --locked
uv run --project eval --locked python -m pytest eval/tests -q
uv run --project eval --locked python -m eval.cli report
```

The committed dataset and results are immutable snapshots. `build --data <new-directory>` collects a fresh sample and caches query, variables, raw response, fetch time and rate headers. The default sample follows the preregistration plus its pagination amendment. Do not overwrite it.

**Model results BLOCKED:** the existing credential returned HTTP 401 on both attempted model calls; zero model answers exist. Do not retry it. Arm C completed 124 same-record checks. Three repeats are planned, zero model repeats completed, and all model accuracy/CI values are undefined. The catalog is discovery evidence, not a successful inference test.

Only after a valid `OPENROUTER_API_KEY` is supplied through the environment (or gitignored root `.env`), resume the same journal:

```powershell
uv run --project eval --locked python -m eval.cli run --resume-blocked
uv run --project eval --locked python -m eval.cli report
```

Ordinary `run` preserves model circuit breakers and never retries blocked observations. Explicit resume retains prior failures, skips successful observations and uses the original model selection, prompts and sample. The append-only JSONL journal stores attempts, response/served-model metadata and exact prompts for successful calls; reporting uses each observation's latest entry. Back up the journal before resuming; do not run concurrent writers. Reports never invoke the network. Transport errors get at most two retries; authentication/quota failures stop that model immediately. AniList requests are at least 2.1 seconds apart; model calls at least 3.1 seconds apart, serially. These limits are per process.

Model IDs come from `EVAL_MODELS` (two comma-separated IDs) or the lexical first two zero-price `:free` catalog entries for a **new** manifest. No paid fallback is used. A stored manifest overrides later environment model changes. Results include per-model, per-type and per-popularity coverage, errors, exact accuracy, abstention, confident-wrong rate, parse failures and citation validity. Clustered bootstrap uses 10,000 seeded title resamples within strata. The known-ID retrieval and shared-record ceiling do not test entity search or validate AniList independently.
