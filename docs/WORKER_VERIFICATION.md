# Answer Worker verification

Latest Task 6 checks: **105 Worker tests + 13 dependency-free smoke unit tests pass**, TypeScript/formatting and dry-run bundle pass (55.04 KiB / 14.47 KiB gzip). Five local real-provider requests measured **421 / 600 / 905 ms min/median/max**, all HTTP 200; evidence and limits below.

Date: 2026-11-06. Branch: feat/worker. The frozen wire contract is unchanged; studio value/recordValue strings encode JSON arrays so exact set equality preserves studio-name boundaries. Tagged text is generated from compared values, and optional novel commentary remains in the unverified explanation, while the short answer is represented by claims. See CONTRACT.md for this trust boundary.

## Reproducible local checks

From worker/: npm run format:check; npm run check; npm test; npm run build. Task 5 checkpoint: **81 tests passed across four files**, TypeScript passed, formatting passed, and the dry-run bundle was **47.44 KiB / 12.62 KiB gzip**. The test suite never calls upstream services: fetch is mocked and credentials are dummy strings. Local Miniflare D1 executes the real migration and SQL, including concurrent counter and gate tests. The development startup applied the local migration successfully.

Scorer reference: eval/scoring.py, SHA-256 69ac5e23ba6bb62a3d2e15b6012f1e5cb6a59fcf62c93140c35fe424c84b3079. Normalization uses NFKD, full Unicode case-fold exceptions and Python decimal digits; the generated tables use Unicode 14.0.0. Complete studio-set equality and exact integer strings follow the scorer. JSON numbers cannot preserve Python's int/float distinction after JavaScript parsing, so model claim values must be strings: decimal strings and all numeric-typed model values are rejected, avoiding 12.0 being accepted as an integer claim. Bare JSON only; fences remain invalid, consistent with the evaluation transport rule.

Mocked coverage includes verified/conflict/unchecked, studio sets, accents, numeric strictness, null record fields, injection-safe canonical text, code fences, malformed output, next-provider retry, all providers unavailable, successful-HTTP billing errors, Retry-After circuits, global budget, concurrent admissions, stale and fresh cache, duplicate fetch coalescing, not-found/upstream errors, client/source limits, input/media/body limits, CORS, key-safe health and smoke status output, config override rejection and zero-price discovery. Per-provider compatible payload shapes are exercised without live calls.

## Opt-in live diagnostic: status only

Exactly one synthetic chat request was attempted for each configured provider with npm run smoke; no retries, dataset prompts or response bodies were saved. OpenRouter's public catalog was also fetched to validate the selected free entry.

| Provider | Observed status |
|---|---|
| Z.ai | HTTP 429 |
| Groq | HTTP 200, valid JSON |
| NVIDIA | Network or 30-second timeout; no HTTP status obtained |
| OpenRouter | HTTP 200, valid JSON |

HTTP 200 plus valid JSON establishes output transport only. It does not establish factual accuracy, permanent free access, or the availability of every configured model. Z.ai's status does not identify the cause of its quota response; NVIDIA's timeout does not establish a bad key. No raw bodies, keys or account ids were printed.

A separate local Wrangler request with MODEL_DAILY_BUDGET=0 reached real AniList and returned HTTP 200, record-only, quota exhausted, six verified claims; no model was called by that request. Local /api/health returned HTTP 200 and provider configuration flags, and invalid input returned HTTP 400 invalid_request. The local server was stopped afterward.

No deployment, sign-up, PR or public endpoint was created. Remaining user actions: authenticate existing Cloudflare account, create/bind D1, set the real site origin and production secrets, deploy, then verify edge CPU and public CORS against the UI. No model-quality or evaluation-threshold result is claimed here.


## Task 6: latency and answer presentation

Default per-provider scope is 8 seconds (PROVIDER_TIMEOUT_MS or a provider timeoutMs override), including catalog discovery, quota reservation and completion parsing; total request deadline is 15 seconds (REQUEST_DEADLINE_MS), including source work. The provider receives an abort signal and is not retried within the same account. A total-deadline race bounds the answer even if provider bookkeeping is slow; cooldown persistence is retained with waitUntil, and checks after every admission prevent a late model call. No source record means the existing upstream error instead of invented record-only data. D1 availability still governs source recovery; this is not a deployed-edge latency SLA.

Provider health is persisted separately from quota counters. Recent success (24-hour horizon) precedes unknown providers, then previous failures; providers still in a cooldown are skipped. Config order breaks ties and is now Groq / OpenRouter / Z.ai / NVIDIA based on the earlier observations. Timeout/429 providers move behind successful providers during cooldown; Retry-After remains a lower bound. Expired failures remain behind a recent success until they are needed and recover. Existing budgets/circuits were preserved, never reset to obtain a favorable result.

Explanation uses a deliberately conservative lexical rule, not semantic model grading: the short answer is not echoed; optional explanation is split into sentences and deduplicated. A retained sentence needs at least four alphanumeric tokens and two distinct tokens not already in claim texts/values, record title or a fixed grammatical/field-word set. Repeated values such as MADHOUSE, studio-label paraphrases and episode counts therefore return null. New context may be omitted conservatively, and passing this rule does not verify it; retained explanation stays unverified. Checked claim values/text/status and the wire shape do not change.

### Five timed requests through local Wrangler with real providers

Measured at 2026-11-05T22:12:44Z (2026-11-06 local), serial requests using the existing local D1 state; cache/health state was not artificially cleared. No response text was logged or saved. These observations are from the new ordering/timeout path before final slow-bookkeeping/input-body edge-case hardening; they are a small local sample, not cold-start measurements or population latency percentiles.

| Request | HTTP | Provider | Mode / quota | Elapsed | Explanation status |
|---|---:|---|---|---:|---|
| 1 | 200 | Groq | model / ok | 905 ms | omitted |
| 2 | 200 | Groq | model / ok | 439 ms | omitted |
| 3 | 200 | Groq | model / ok | 421 ms | omitted |
| 4 | 200 | Groq | model / ok | 600 ms | omitted |
| 5 | 200 | Groq | model / ok | 803 ms | omitted |

**Min 421 ms; median 600 ms; max 905 ms.** Raw status/timing metadata: timing-worker-2026-11-06.json. The local current-UTC-day model counter increased from 8 to 13: **five attempted model calls for five answers**. No additional per-provider smoke was run in Task 6, and no deployed site was contacted. The local server was stopped after measurement.

Hedging is deliberately disabled. An immediate second-provider hedge would spend ten attempted calls for these five answers instead of five (100% more); a hedge delayed by one second would not have fired in any of these observations. This five-request sample supplies no evidence of a benefit worth speculative free-quota consumption. Circuit skipping and healthy-first ordering address the observed overloaded-provider problem while preserving one-call healthy responses; mocked timer tests cover the 8/15-second failure bounds, abort delivery, per-provider overrides, total budget after source time and absence of post-deadline calls.

### CI and deployment-smoke evidence

105 Vitest cases across six files pass; the original 81 cases remain covered with the old explanation expectation updated to the explicitly requested null behavior. Thirteen Node tests for scripts/smoke-live.mjs use only injected fetch and verify contract rejection, expected title, exactly one POST and status-only failures. TypeScript, Prettier, YAML parsing/formatting and local-only dry-run build pass. The new deployment smoke script was NOT executed against a live endpoint.

Opened and verified complete action tags: [checkout v4.2.2](https://github.com/actions/checkout/releases/tag/v4.2.2), [setup-node v4.4.0](https://github.com/actions/setup-node/releases/tag/v4.4.0), [setup-uv v6.8.0](https://github.com/astral-sh/setup-uv/releases/tag/v6.8.0); the uv binary is pinned to the [verified 0.11.21 release](https://github.com/astral-sh/uv/releases/tag/0.11.21). CI uses no provider secrets and runs no live calls.

Branch integration limitation: this worker-only checkout has neither eval/pyproject.toml nor web/package.json. The required Python job contains the exact requested locked command and intentionally requires the evaluation harness to be integrated before CI can be green; it was not run locally or falsely marked passed. The web job's file-detection guard will skip it until the UI is integrated. Worker and smoke checks are verified locally; remote Actions execution is unverified because no push/PR was requested. No PR, deployment or sign-up was made.
