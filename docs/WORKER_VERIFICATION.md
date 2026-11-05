# Answer Worker verification

Date: 2026-11-06. Branch: feat/worker. The frozen wire contract is unchanged; studio value/recordValue strings encode JSON arrays so exact set equality preserves studio-name boundaries. Tagged text is generated from compared values, and all free-form model answer text remains in the unverified explanation. See CONTRACT.md for this trust boundary.

## Reproducible local checks

From worker/: npm run format:check; npm run check; npm test; npm run build. Final result: **81 tests passed across four files**, TypeScript passed, formatting passed, and the dry-run bundle was **47.44 KiB / 12.62 KiB gzip**. The test suite never calls upstream services: fetch is mocked and credentials are dummy strings. Local Miniflare D1 executes the real migration and SQL, including concurrent counter and gate tests. The development startup applied the local migration successfully.

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
