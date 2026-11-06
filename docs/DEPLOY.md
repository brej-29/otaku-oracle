# Site and answer API deployment

## Dusk cinema interface

The client stays on the existing React/Vite stack and keeps the separate answer Worker contract. Search, questions and evaluation data are runtime interactions. A server framework would add another deployment/runtime without improving the native-scroll camera or changing the existing non-streaming answer API. This revision adds no animation dependency: CSS handles transforms and the original eight-frame courier; canvas draws ambient particles only while visible. Exact web dependency versions and their published dates are in dependency-releases.json.

Target: Cloudflare Pages Free for the client, plus the existing answer Worker. No deployment or account creation was performed. As checked on 2026-11-06, Pages Free permits 500 builds/month, one concurrent build, 20,000 files and 25 MiB per file ([limits opened](https://developers.cloudflare.com/pages/platform/limits/)). Only web/dist is uploaded; review screenshots and raw audit reports are excluded from that build. The separate API retains its own quota protections.

From a checkout of this branch, with Node 24, build the client against the actual deployed API URL:

~~~powershell
cd web
npm.cmd ci
$env:VITE_API_BASE = 'https://YOUR-ANSWER-WORKER.workers.dev'
npm.cmd run build
cd ../worker
npm.cmd ci
npx.cmd wrangler login
# Skip create if the project already exists in the current account.
npx.cmd wrangler pages project create otaku-oracle --production-branch main
npx.cmd wrangler pages deploy ../web/dist --project-name otaku-oracle --branch main
~~~

Use the project URL returned by the command; a taken name may receive a suffix. Set SITE_ORIGIN in worker/wrangler.toml to that exact origin, then follow the existing API database/secret/deployment procedure below and deploy the Worker. Its allowed origin is deliberately exact. VITE_API_BASE is a public endpoint, never a credential. Do not put provider keys in a web environment variable. When it is absent the client clearly labels its record-only demo, and unsupported questions receive no substitute answer.

The [direct-upload commands opened](https://developers.cloudflare.com/pages/get-started/direct-upload/) document project creation and deployment. To preview the backend-connected interface locally, keep one Worker on 8787 and run from web/:

~~~powershell
$env:VITE_API_BASE = 'http://localhost:8787'
npm.cmd run dev -- --host localhost --port 5173 --strictPort
~~~

Leave VITE_API_BASE empty for the labelled demo. The existing service allows http://localhost:5173; another frontend origin will fail CORS. Do not start a second Worker on an occupied port. Local preview and deployment do not establish broad production availability: use the prepared smoke below once both endpoints are deployed.

## Answer Worker


Prepared for the user's existing Cloudflare account; nothing has been deployed and no account has been created. Run commands below from `D:\Project\anime-app-wt\worker\worker` in PowerShell (use `npm.cmd` / `npx.cmd` if execution policy blocks the PowerShell shims). Node 24 is the tested runtime. Do not enable a paid plan or buy provider credits.

## Local use

```powershell
npm.cmd ci
npm.cmd run format:check
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

`build` is `wrangler deploy --dry-run`: it only bundles locally. `dev` first applies the migration to local D1, then starts local Wrangler, without requiring login. The pinned tool runtime supports compatibility date 2026-11-04; do not set a future date relative to that runtime.

The ignored `worker/.dev.vars` has already been populated from the user's source credentials without changing the source file. A fresh checkout can copy `.dev.vars.example` and fill it privately. Mappings are Z_API_KEY -> ZAI_API_KEY, GROQ_API_KEY -> GROQ_API_KEY, NVIDIA_API_KEY (falling back to the source's misspelled NVDIA_API_KEY) -> NVIDIA_API_KEY, and OPENROUTER_API_KEY -> OPENROUTER_API_KEY. IP_HASH_SECRET is a separate random local secret. Never put any credential in wrangler.toml, source control, command arguments, screenshots or logs.

```powershell
# Health is configuration presence, not provider availability or deployment readiness.
Invoke-RestMethod http://localhost:8787/api/health

# Deliberately disables model calls for a local record-only check.
npm.cmd run dev -- --port 8788 --var MODEL_DAILY_BUDGET:0
```

In a second terminal for that zero-budget server:

```powershell
$askBody = @{ titleId = 1; question = 'How many episodes?' } | ConvertTo-Json
Invoke-RestMethod http://localhost:8788/api/ask -Method Post -ContentType application/json -Body $askBody
```

The real provider diagnostic is explicitly opt-in:

```powershell
npm.cmd run smoke
```

This makes exactly one synthetic chat request per configured provider, serially, using its first configured/verified-free model, with no retries. OpenRouter also requires one public catalog GET to select a zero-price :free entry. Output contains only provider/status lines; bodies, model answers, keys and account identifiers are never printed or saved. It does not test AniList or claim factual accuracy, and consumes existing provider quota separately from the Worker's D1 budget. Do not repeatedly rerun it during a shared-key evaluation.

## User-run deployment

The following commands are prepared instructions; they have NOT been executed. Use only the existing account on Workers Free.

```powershell
npx.cmd wrangler login
npx.cmd wrangler d1 create oracle
```

Replace the all-zero `database_id` in wrangler.toml with the returned database identifier. Set SITE_ORIGIN to the site's exact origin (scheme and hostname, no trailing slash or path); keep CLIENT_DAILY_LIMIT, MODEL_DAILY_BUDGET and PROVIDER_COOLDOWN_SECONDS deliberately conservative. Default limits are 50 requests per client per UTC day and 100 model calls globally per UTC day. Every attempted chat call, including a failed one, consumes one unit. Configuration order is worker/providers.json; an optional PROVIDERS_JSON Worker variable replaces that list. Model ids, endpoints, allowlists and transport options belong there, never application logic. Default cold order is Groq, OpenRouter, Z.ai, NVIDIA based on observed availability; recent successful providers are prioritized by D1 health, and active cooldowns are skipped. The first model in each provider entry is the active choice; reorder that list to select another allowlisted model. A failed provider falls through to the next provider, rather than retrying another model against the same account quota. To remove a provider, omit its secret or remove its config entry.

```powershell
npx.cmd wrangler d1 migrations apply oracle --remote
npx.cmd wrangler secret put IP_HASH_SECRET
npx.cmd wrangler secret put ZAI_API_KEY
npx.cmd wrangler secret put GROQ_API_KEY
npx.cmd wrangler secret put NVIDIA_API_KEY
npx.cmd wrangler secret put OPENROUTER_API_KEY
```

Each secret command prompts for its value; never put the value in the command itself. Generate a separate random production IP_HASH_SECRET with a password manager and paste it at the prompt. Omit unconfigured providers' secret commands. Remote secrets do not automatically read .dev.vars.

After confirming the D1 id, exact site origin, free account and allowlists:

```powershell
npx.cmd wrangler deploy
```

Check the returned URL's `/api/health`, then make a single controlled `/api/ask` request. Validate the actual site's CORS behavior, source links, the three claim states and quota fallback before routing public traffic. No static eval endpoint is provided: the UI owns its summary file. Do not ship raw draft/explanation text with a verified badge; render all strings as text, never HTML.

## Protection and operations

- D1 is mandatory. Conditional INSERT/UPSERT ... RETURNING counters are atomic; D1 failures fail closed with a generic 502. The client key is HMAC-SHA256 of a daily date plus Cloudflare's connecting IP under a server secret; raw IPs are not stored. Forwarded headers are ignored. Missing IPs share a local bucket.
- AniList records use schema-version/id keys, 24-hour freshness and original fetchedAt timestamps; stale records are served on outage. Fetches coalesce per isolate, with D1 leases for cross-isolate coordination. The indexed sliding window admits at most 25 upstream starts in any minute across the shared D1 database. AniList 429 Retry-After is also persisted globally. Limits cover this Worker, not unrelated clients sharing an upstream IP.
- Circuits persist per provider in D1. Authentication, billing and quota responses open for at least 15 minutes or the full Retry-After, whichever is longer; HTTP-date and seconds are supported. Timeouts/network failures use the configured provider cooldown; other HTTP/invalid-output failures cool down for 30 seconds. Billing error envelopes in successful HTTP responses also open the circuit. There is no sleep/retry storm inside a request.
- Invalid final output retries once with the next provider; after two invalid outputs the Worker returns record-only. Other provider failures fall through the configured chain. Providers cannot override the enforced model, messages, token budget or zero-price routing fields through request options. OpenRouter catalog entries must have a :free suffix and explicit zero prompt/completion prices, cached for one hour; paid provider fallback is disabled and request maximum token prices are zero.
- A daily scheduled cleanup deletes expired counters, leases, catalog entries and circuits. Stale source records are retained for outage fallback; monitor D1 storage growth and curate old records if the catalog grows. Do not clear counters or circuits to evade quota. Budgets reset at midnight UTC, not on restart.
- PROVIDER_TIMEOUT_MS defaults to 8000, with optional timeoutMs per providers.json entry; REQUEST_DEADLINE_MS defaults to 15000 from request receipt and caps the remaining source/model work. Fetches abort at the earlier provider/total limit; once a source record is available, reaching the total deadline returns record-only. If no record can be retrieved or cached, the frozen upstream error remains 502. Incomplete input bodies are cancelled and rejected. D1 reads needed to recover a record remain subject to D1 availability; there is no fabricated fallback record. Post-deadline provider cooldown writes use waitUntil, while guards prevent later calls from starting. No hedging or speculative duplicate calls are used. Cancellation does not refund attempted calls. Missing credentials are skipped without network calls; no automatic upgrades are permitted.

## Current free-plan constraints and opened sources

Checked 2026-11-06. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) list 100,000 requests/day, 10 ms CPU per HTTP request, 128 MB memory, and 50 subrequests/request on Free. Network/database wait is excluded from CPU. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) lists 5 million rows read/day, 100,000 rows written/day and 5 GB total storage on Free. Daily caps are account-wide; the app's 100-call model budget is not a Cloudflare billing control. Deployed edge CPU, real multi-region latency and account eligibility remain unverified until the user deploys; do not infer those from local wall-clock time.

[D1 database API](https://developers.cloudflare.com/d1/worker-api/d1-database/) and [prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) support the bound statements and batch operations used here. Tests use actual local D1 and concurrent calls, not a mock counter.

[Z.ai thinking](https://docs.z.ai/guides/capabilities/thinking) documents the thinking switch; the configured Flash settings carry forward the existing evaluation calibration, not a claim of this smoke succeeding. [Groq reasoning](https://console.groq.com/docs/reasoning) documents low effort and hiding reasoning; [structured outputs](https://console.groq.com/docs/structured-outputs) documents JSON mode. [Groq limits](https://console.groq.com/docs/rate-limits) explains organization-level request and token windows. [NVIDIA LLM APIs](https://docs.api.nvidia.com/nim/reference/llm-apis) documents the compatible chat endpoint; this run did not establish NVIDIA availability. [OpenRouter free variants](https://openrouter.ai/docs/guides/routing/model-variants/free) explicitly warns that paid fallback can incur charges, which is why this Worker selects and constrains free entries. These sources were actually opened; no new provider account or subscription was created.


## Deployed site smoke check (prepared, not run)

From the repository root, after the user deploys both site and API:

```powershell
$env:SITE_URL = 'https://YOUR-EXISTING-SITE.example'
$env:API_URL = 'https://YOUR-WORKER.example'
node scripts/smoke-live.mjs
```

SITE_URL is the page URL; API_URL is the Worker base URL. EXPECTED_TITLE optionally overrides the default Otaku Oracle title substring. The dependency-free Node script checks HTTP 200 and the page title, health ok/configuration shape, then exactly one POST /api/ask for id 154587. It checks the frozen response structure and a verified studio claim whose recordValue contains MADHOUSE (including the contract's JSON-encoded studio set). It prints pass/fail status only and exits nonzero on failure, without retries or response-body output. That single API request uses normal app budgets and may invoke the ordinary fallback chain. This script has only been exercised with mocked fetch in tests; no deployed endpoint exists and it was not run against a live site.

## Continuous integration

.github/workflows/ci.yml includes required locked uv evaluation tests, the Worker install/type/format/test/dry-run pipeline, and web install/tsc/build only when web/package.json exists. It needs no application secrets and never runs either live smoke command. Apply both D1 migrations before deploying this revision. See WORKER_VERIFICATION.md for exact action-version sources and the current branch-integration limitation.


## Source extension

Before enabling the additive source contract, apply migration 0003 along with the existing migrations: from worker/, run `npx wrangler d1 migrations apply oracle --local` for development or `npx wrangler d1 migrations apply oracle --remote` only after authenticating and selecting the owner's real D1 binding. `MULTI_SOURCE_ENABLED=true` and `SOURCE_DAILY_BUDGET=500` are supplied in wrangler.toml. Set the budget to zero to retain links and recorded AniList facts without secondary upstream requests. No new account or key is required for AniList, Jikan or Wikidata. No deployment has been performed. Source availability, approval requirements and limits are in SOURCES.md.

For local source-only review: use port 8788 for source-only local review so the existing Worker on 8787 is not duplicated; the web origin remains http://localhost:5173. Set VITE_API_BASE=http://localhost:8788 in the web terminal. Local source-only review intentionally uses MODEL_DAILY_BUDGET=0 and a generated, git-ignored IP_HASH_SECRET; no provider key is needed for this mode. Source terms, limits and all negative availability checks are in SOURCES.md and the source PR. The broader verification is an unmeasured extension, not a new evaluation result.

## Live deployment notes (2026-11-06)

- Site: Cloudflare Worker with static assets (`web/wrangler.jsonc`, `npx wrangler deploy` from `web/` after `npm run build` with `VITE_API_BASE` set). `wrangler pages project create` only created a placeholder Worker with the installed Wrangler, so Pages was not used.
- Answer API: Cloudflare Worker `otaku-oracle-answer` with D1 `oracle`.
- AniList returned HTTP 403 to requests from Cloudflare Workers (cause not confirmed with AniList), while the same request from a home network returned 200. AniList calls therefore go through a small relay (`relay/`, Vercel Hobby) when the `ANILIST_RELAY_URL` and `ANILIST_RELAY_KEY` secrets are set. The relay requires the `x-relay-key` header and only forwards to graphql.anilist.co.
- Hugging Face free tier offers only Static Spaces. Docker Spaces need PRO, so the API could not move there.
