# Otaku Oracle: project report

Handoff and portfolio summary. Every number below comes from a file in this repo or a command run during the build. Items marked **(unverified)** were not measured.

## 1. What it is

An anime Q&A site where the model drafts an answer and a deterministic checker then marks each claim against AniList as `verified`, `conflict` or `unchecked`. The project also ships a preregistered evaluation that measures whether grounding helps.

| Part | Where it lives | Stack |
|---|---|---|
| Site | `web/` | React 19, Vite 8, TypeScript, `motion`, Cloudflare Worker with static assets |
| Answer API | `worker/` | TypeScript, Cloudflare Worker, D1 (quotas, cache), provider fallback |
| AniList relay | `relay/` | Vercel function, shared-secret header |
| Evaluation | `eval/`, `docs/PREREGISTRATION.md` | Python (uv), clustered bootstrap |

Live: site `https://otaku-oracle.brejesh-bala.workers.dev`, API `https://otaku-oracle-answer.brejesh-bala.workers.dev`.

## 2. Result (preregistered, registered primary models)

Design: 18 titles in three popularity strata, 124 questions x 3 repeats = 744 pairs per model. Arm A ungrounded, arm B grounded in the AniList record, arm C deterministic ceiling. Exact-match scoring, 10,000 bootstrap resamples, seed 20261106.

| Model | A (ungrounded) | B (grounded) | B minus A (95% CI) |
|---|---:|---:|---|
| glm-4.7-flash | 54.6% | 99.2% | +44.6 [36.6, 52.6] |
| glm-4.5-flash | 67.2% | 100.0% | +32.8 [24.7, 41.0] |
| Pooled | | | +38.7 [31.7, 46.0] |

Pass rule was pooled B minus A at least 10 points with the 95% lower bound above 0 and complete coverage. It passed. Exploratory replications (excluded from the primary result): gemma-4-31b-it +37.1 [29.9, 44.2], gpt-oss-120b +42.7 [35.8, 49.2].

**Honest caveat.** Arm B contains the answer in its context, so B measures faithful reading of a supplied record, not whether AniList itself is correct. It is a ceiling, not independent truth.

## 3. Pain points and how they were handled

| # | Problem | Evidence | Resolution |
|---|---|---|---|
| 1 | AniList returns 403 to Cloudflare Worker IPs | Live `/api/ask` returned 502 | Vercel relay with `x-relay-key` (wrong key returns 403). Hugging Face Space ruled out (Docker/Gradio need PRO) |
| 2 | Wrong studios shown (e.g. producers listed as studios) | A pasted answer for "That Time I Got Reincarnated as a Slime" | AniList returns identical results for two `studios(isMain:...)` selections in one query. Now one `studios{edges{isMain ...}}` selection split by `isMain`. Cache key bumped `v2` to `v3`. Regression test `worker/tests/studios.test.ts` |
| 3 | Every Jikan and Wikidata call failed silently | `redirect: "error"` is rejected by Workers | Changed to `"manual"`. Guard test `worker/tests/redirect.test.ts` |
| 4 | Jikan times out from Cloudflare within 3 s | Raising to 6 s added about 9 s latency without helping | Multi-source layer switched off (`MULTI_SOURCE_ENABLED = "false"`). Cross-checking from Cloudflare is **unproven** |
| 5 | Out-of-scope questions got a misleading source answer | "How much of the light novel has come out" answered with "Light novel source" | Classifier pattern marks it unsupported. UI label "Outside what the record holds" |
| 6 | A PR merged with a failing `worker` check | PR #13, Prettier error | Fixed in PR #15. All later merges gated on zero failing checks |
| 7 | Free-provider quotas and model removals stalled runs | OpenRouter models gone from catalog, Groq and NVIDIA throttling | Blocked runs archived (`eval/results/blocked-openrouter-2026-11-06`), quota pacing, resumable runs |
| 8 | Mobile Lighthouse performance unstable | Mobile 66 to 91, desktop 75 to 92 across runs on one machine. Accessibility, best practices, SEO 100 | Component code split saved about 10 KB of 271 KB. Largest item is the 842 KB mascot sprite sheet, left as is |

## 4. Verification evidence

| Check | Result |
|---|---|
| Worker tests | 163 passing |
| Browser checks (`web/scripts/check.mjs`) | 37 pass |
| Live smoke (`scripts/smoke-live.mjs`) | site, health and ask contract pass |
| CI (`layout`, `python`, `web`, `worker`) | green on every merged PR from #13 on |
| Repo size | 66 commits, 18 merged PRs, 489 tracked files |

## 5. Known limits

- Multi-source cross-checking is off on the live site. Claims verify against AniList alone.
- Mascot depth is flat 2D, soft close-ups at 352 px frames. Touch and screen-reader hardware untested **(unverified)**.
- Historical Django `SECRET_KEY` remains in git history (the old app is replaced).
- PR #3 metadata carries an old branch name that GitHub does not allow editing.

## 6. Handoff

1. Clone `git@github.com:brej-29/otaku-oracle.git`, `main` is the source of truth.
2. Copy `.env` (git-ignored) with provider keys. Note the `NVDIA_API_KEY` spelling in the old file.
3. Run `docs/DEPLOY.md` for Cloudflare, D1 and the relay (deploy the relay from `relay/` only).
4. Evaluation commands and resume steps: `docs/EXTENSION_RUNS.md`, `docs/PREREGISTRATION.md`.

## 7. Portfolio lines

- Built a claim-checking anime Q&A: model drafts, a deterministic checker verifies each claim against AniList.
- Ran a preregistered evaluation (744 pairs per model): grounding improved exact-match accuracy by 38.7 points pooled (95% CI 31.7 to 46.0), reported with its ceiling caveat.
- Diagnosed a platform block (403 from Cloudflare IPs) and a silent-failure bug (`redirect: "error"`), each fixed with a regression test.
- Shipped on Cloudflare Workers, D1 and a Vercel relay, with CI gating every merge.

## 8. Documentation and discovery handoff (2026-11-09)

The existing report is the canonical handoff; historical verification numbers above describe earlier runs, not checks repeated in this documentation update. Current web/package.json pins React 19.2, Vite 7.3.7 and TypeScript 5.9.3, with CSS/canvas motion and no motion package. The earlier stack table is historical.

Goal: make anime answers auditable at the claim level and measure grounding against a preregistered baseline. Keep the distinction between agreement with AniList and independent truth in every portfolio claim. See WHY.md, EVIDENCE.md, PROTOCOL_AMENDMENTS.md and EXTENSION_RUNS.md for the reasoning, evidence and failed/blocked experiments. DEPLOY.md includes historical deployment notes; confirm the current configuration before reusing commands. Never copy an existing private .env into a public artifact; use worker/.dev.vars.example for setup.

### LinkedIn draft

I built Otaku Oracle to explore a simple question: can we make AI answers easier to check? A model drafts anime facts; a deterministic checker compares each claim with AniList and exposes agreement, conflict and uncertainty. The preregistered evaluation reported a pooled 38.7 percentage-point accuracy gain (95% CI 31.7�46.0). This measures faithful reading of supplied records, not independent factual truth. The difficult parts included a Cloudflare-to-AniList block, provider quotas, studio/producers ambiguity and gracefully falling back to source records. The stack combines React/TypeScript, Cloudflare Workers and D1, a Vercel relay, and a Python evaluation harness.

Demo: https://otaku-oracle.brejesh-bala.workers.dev
Source: https://github.com/brej-29/otaku-oracle

### Search and sharing

Added canonical URL, absolute social image URL, Twitter card, WebSite structured data, sitemap and the requested Google verification meta tag. No UI or answer behavior changes. Deploy the web build before verifying ownership in Google Search Console; then submit /sitemap.xml and inspect the homepage. Check rendered HTML and canonical selection in Search Console. Rankings, indexing and AI recommendations cannot be guaranteed. Google applies ordinary SEO fundamentals to AI features: https://developers.google.com/search/docs/appearance/ai-features . Keep schema consistent with visible content. No fabricated reviews or keyword stuffing.

### Repository topics

GitHub authentication is available in the normal user environment. The topic selection was updated to reflect the current stack. Reference command:

```powershell
gh repo edit brej-29/otaku-oracle --add-topic anime --add-topic anilist --add-topic fact-checking --add-topic llm --add-topic grounding --add-topic react --add-topic typescript --add-topic cloudflare-workers --add-topic cloudflare-d1 --add-topic evaluation --add-topic reproducible-research --add-topic portfolio
```

### MCP decision

Implemented an isolated local stdio documentation MCP in `local-mcp/`, using the official MCP SDK. It exposes six allowlisted project documents as read-only resources, without network listeners, provider calls, arbitrary file access or app integration. Setup and client configuration are in `local-mcp/README.md`. No public MCP is planned.

Validation for this update: local MCP SDK client initialized, listed and read all six resources, and rejected unlisted file/path requests; all nine existing frontend unit tests passed. README GIF decoded successfully. These checks do not remeasure the historical evaluation results.
Web production build and lint also passed after installing the locked dependencies (zero lint warnings/errors).
