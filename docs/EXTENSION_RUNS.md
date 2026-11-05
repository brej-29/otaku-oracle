# Exploratory replication operations — 2026-11-06

These runs were added **after** the registered Z.ai primary began. They retain its dataset hash, questions, prompts, seed, strict JSON scorer, three repeats and clustered bootstrap. They cannot rescue, overturn, or enter its pooled threshold. Each one-model extension plans 744 A/B observations. Do not restart or modify the primary (Python PID 44212).

| Role | Provider / model | Output folder | Calibration |
|---|---|---|---|
| Registered primary | Z.ai / two GLM models | `eval/results/zai-flash-2026-11-06` | Existing primary calibration, unchanged |
| Exploratory replication | Groq / GPT-OSS 120B | `eval/results/replication-groq-2026-11-06` | `eval/results/calibration-groq-extension-2026-11-06/calibration.json` |
| Exploratory replication | NVIDIA / Gemma 4 31B | `eval/results/replication-nvidia-2026-11-06` | `eval/results/calibration-nvidia-extension-2026-11-06/calibration.json` |

Calibration uses three fixed synthetic integer/JSON prompts per extension, never dataset questions. Groq uses documented low reasoning effort, JSON mode, no returned reasoning, and a 1,024 completion-token budget; NVIDIA requests JSON mode at 256 tokens. This budget difference limits direct comparison to the primary and is recorded in the extension manifest. Fenced JSON remains an error; no fence stripping or model-based grading is introduced. Failed calibration attempts remain available locally, with account-identifying upstream error messages suppressed.

Grounded prompt sizes are measured for every question before launch: 1,318–1,851 UTF-8 bytes, plus a 256-token framing reserve as a conservative token bound; actual provider prompt/total tokens are logged from each response's usage. The Groq quota ledger also records these measurements and safe rate headers. These byte lengths are not an exact provider tokenizer count. Cache preparation reads available primary cache snapshots without writing into them, fetches remaining records through one serial client (at most 20/minute), then prepopulates both isolated extension caches. The extension writers therefore make no competing AniList cache refreshes during the run.

The first Groq grounded observation measured **489 prompt tokens**. Its response confirmed request-limit 1,000 and token-limit 8,000, with reset/remaining headers preserved in the local journal; the official documentation defines those windows as daily requests and per-minute tokens. Synthetic Groq calibration passed 3/3 with the registered extension request settings. This is transport/quota evidence, not an accuracy claim.

NVIDIA's JSON-mode synthetic calibration also passed 3/3 without stripping fences. One check required two transport/invalid-JSON retries before succeeding; those failures remain in the local calibration evidence. This establishes the chosen output transport for this hosted model but does not promise reliable latency or quota.

Groq's persistent rolling quota ledger is `eval/results/groq-quota-2026-11-06.json`. The configured limits are conservative relative to the [documented free tier](https://console.groq.com/docs/rate-limits); cached tokens are counted conservatively, and other organization traffic may consume capacity. Daily usage can require staged runs across days. NVIDIA's fixed credit/RPM numbers are unverified; [staff describe rate-limited research trial access](https://forums.developer.nvidia.com/t/request-more-4-000-credits-option-on-build-nvidia-com/344567). Use existing credentials only, no cards, sign-ups, paid fallback, or account-inaccessible model probes. NVIDIA_API_KEY takes precedence over NVDIA_API_KEY; `.env` is never rewritten.

Check the relevant `process.json` and operating-system PID before resuming. Never launch another writer for the same provider/output while it is alive. After a process exits and its blocker is resolved, resume from the repo root with the exact existing config, manifest, calibration and quota ledger:

```powershell
uv run --project eval --locked python -u -m eval.batch --provider groq --output eval/results/replication-groq-2026-11-06 --calibration eval/results/calibration-groq-extension-2026-11-06/calibration.json --resume-blocked
uv run --project eval --locked python -u -m eval.batch --provider nvidia --output eval/results/replication-nvidia-2026-11-06 --calibration eval/results/calibration-nvidia-extension-2026-11-06/calibration.json --resume-blocked
```

For a long continuation, use `Start-Process` with `-WindowStyle Hidden`, the same arguments above, and separate stdout/stderr paths in that output folder as demonstrated in `eval/README.md`. Each batch writer holds an OS lock and generates its own report on exit. Reports can be regenerated offline using `eval.cli report --output <folder>`; no primary report or journal is changed by an extension report. Commit config/code/docs only while runs are live; checkpoint results and logs only after writers stop. The optional OpenRouter replication is not activated because it is unnecessary to this dispatch and has unresolved access/capacity constraints.
