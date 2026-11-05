# Factual evaluation

Run from the repository root with Python >=3.11 and uv:

```powershell
uv sync --project eval --locked
uv run --project eval --locked python -m pytest eval/tests -q
uv run --project eval --locked python -m eval.cli report
```

The committed dataset and results are immutable snapshots. `build --data <new-directory>` collects a fresh sample and caches query, variables, raw response, fetch time and rate headers. The default sample follows the preregistration plus its pagination amendment. Do not overwrite it.

The original OpenRouter run is archived under `eval/results/blocked-openrouter-2026-11-06/`; its two HTTP 401 attempts are unchanged. Its catalog contains only selected model entries plus the original full-file hash. Do not resume that legacy journal with a different provider.

Provider bases, credential environment-variable names, model IDs, explicit free allowlists and request options live in `eval/providers.toml`. Default: the two authorized free Z.ai Flash models. Obsolete root DEFAULT_MODEL/ALT_MODEL/FALLBACK_MODEL values and the previous EVAL_MODELS setting are ignored. Groq/Mistral inference remains disabled pending separately verified free eligibility; OpenRouter supports live zero-price `:free` discovery for a separately labelled run with a working key. Safe diagnostics never print credential values:

```powershell
uv run --project eval --locked python -m eval.cli health --output eval/results/provider-health-NEW
uv run --project eval --locked python -m eval.cli calibrate --provider zai --output eval/results/calibration-NEW
```

Calibration plans three fixed synthetic JSON prompts per model, never anime questions; it preserves every result, including failures, and refuses to overwrite its archive. Background execution requires an exact provider-config match and at least one schema-valid final answer from each model, with no malformed returned final answer in that calibration. Availability failures remain failures: the archived JSON-mode calibration has four valid final answers out of five recorded checks, with one GLM-4.7 overload failure and its remaining check not attempted. This establishes output format, not reliable capacity or six successful checks. Thinking is disabled and JSON-object output is requested; temperature 0.2, maximum 256 tokens and the registered prompts/scorer are unchanged.

Run in a hidden background process from the repo root (PowerShell):

```powershell
$evalOutput = Join-Path (Get-Location) 'eval/results/zai-flash-2026-11-06'
New-Item -ItemType Directory -Force -Path $evalOutput | Out-Null
$evalProcess = Start-Process -FilePath (Get-Command uv).Source -ArgumentList @('run','--project','eval','--locked','python','-u','-m','eval.batch','--provider','zai','--output','eval/results/zai-flash-2026-11-06') -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -RedirectStandardOutput (Join-Path $evalOutput 'run.stdout.log') -RedirectStandardError (Join-Path $evalOutput 'run.stderr.log') -PassThru
$evalProcess.Id
```

The batch entry point holds an OS writer lock, records its Python PID in `process.json`, and generates reports on exit. Do not start another writer while it is running. A second ordinary invocation after exit skips successful observations and preserves model circuit breakers. To resume a resolved quota/credential block, add `--resume-blocked` to the batch arguments; keep the exact same output path, manifest, provider config, sample and calibration file. Prior failed attempts remain in the journal. The manifest rejects config or prompt changes. There is no paid fallback.

Generate an offline snapshot without stopping the writer:

```powershell
uv run --project eval --locked python -m eval.cli report --output eval/results/zai-flash-2026-11-06
```

Reports include all per-model/type/popularity metrics, paired improvements and 95% CIs from 10,000 seeded title-cluster resamples, plus ten sampled incorrect question/model pairs per arm when available. Fewer are explicitly reported when fewer exist. Coverage must be complete before threshold claims. Reports score each observation's latest journal entry and ignore an incomplete trailing write. A new manifest plans 124 questions × 3 repeats × 2 arms × 2 models = 1,488 calls; C adds 124 deterministic checks. AniList requests are spaced at least 2.1 seconds apart; provider calls at least the configured 3.1 seconds, serially. Transient 429/5xx failures get at most two retries, honoring Retry-After; persistent failure opens that model's circuit breaker, and billing code 1113 stops immediately. These limits are per process. The known-ID retrieval and shared-record ceiling do not test entity search or validate AniList independently.

Partial-run intervals resample only observed title clusters. With one or few observed titles they can be degenerate and do not establish population certainty; use them only as descriptive checkpoints. Snapshot timestamps and journal-entry counts distinguish committed checkpoints from later observations appended by the live process.
