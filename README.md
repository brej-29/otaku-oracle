# Otaku Oracle

Anime answers where every fact is checked against its AniList record and stamped. Facts that match get a seal. Facts that contradict the record are struck through, with the record's value shown. Anything that cannot be checked stays in pencil.

Live: [otaku-oracle.brejesh-bala.workers.dev](https://otaku-oracle.brejesh-bala.workers.dev). Free tiers throughout (Cloudflare Workers and D1, Vercel Hobby relay, free model providers), so answers can be slow, rate-limited (50 questions per client per day, 100 model answers per day overall) or fall back to the record alone.

Status: the preregistered test **passed**. Grounding the model in the AniList record raised accuracy by 38.7 points (95% CI 31.7 to 46.0), pooled over the two registered models, 744 complete pairs, against the pass mark of 10 points with a lower bound above 0. Every hard question is answered in [docs/WHY.md](docs/WHY.md).

| Model | Ungrounded | Grounded in the record | Gain, 95% CI |
|---|---:|---:|---|
| `glm-4.7-flash` (registered) | 54.6% | 99.2% | 44.6 [36.6, 52.6] |
| `glm-4.5-flash` (registered) | 67.2% | 100.0% | 32.8 [24.7, 41.0] |
| `gemma-4-31b-it` (exploratory) | 62.9% | 100.0% | 37.1 [29.9, 44.2] |
| `gpt-oss-120b` (exploratory) | 57.3% | 100.0% | 42.7 [35.8, 49.2] |

Grounded accuracy is a ceiling, since the record holds the answer. The informative number is the ungrounded one: between a third and a half of ungrounded answers were wrong, and the wrong ones were stated with confidence. The gain is largest for obscure titles (53.3 points pooled for the long tail, 28.6 for the most popular). Only 18 titles were tested, so intervals are wide. Exploratory runs are not pooled into the registered result.

## The problem

Chat models answer anime questions fluently, and fluent is not the same as correct. Small facts such as the studio, the episode count or the start year can be wrong, and nobody stops to check them. This project tests whether giving a model the AniList record before it answers improves those facts, and shows the check to the reader.

That is a hypothesis, not a finding. The test and its pass mark were written down before any results existed: [docs/PREREGISTRATION.md](docs/PREREGISTRATION.md), with changes recorded in [docs/PROTOCOL_AMENDMENTS.md](docs/PROTOCOL_AMENDMENTS.md).

## What is in the repo

| Path | What it is |
|---|---|
| `web/` | The interface. Vite, React, TypeScript, `motion`. Design notes in [web/DESIGN.md](web/DESIGN.md). |
| `worker/` | The answer service (Cloudflare Worker). A model drafts claims, a deterministic checker compares each one to the AniList record. |
| `eval/` | The preregistered evaluation harness (Python, uv): dataset builder, providers, scorer, bootstrap intervals, tests. |
| `docs/` | Preregistration, amendments, evidence, architecture, deployment, design comparison, Lighthouse record. |

## How a question is answered

1. You pick one AniList title, so there is no guessing which show you mean.
2. The Worker fetches the record (cached 24 hours, stale served if AniList is down).
3. A free model drafts a short answer as strict JSON claims. The record is passed as data, not instructions.
4. Each claim is compared to the record with exact rules: integers must match, text is normalised, studios compare as sets. No model grades another model.
5. The UI shows each claim as verified, conflicting or unchecked. If every model provider fails or the daily budget is spent, the service answers from the record alone and says so.

## Run it locally

You need Node 20 or newer and, for the evaluation, [uv](https://docs.astral.sh/uv/).

```
# answer service (reads provider keys from worker/.dev.vars, copy worker/.dev.vars.example)
cd worker && npm ci && npm run dev

# interface, in a second terminal (the Worker allows http://localhost:5173)
cd web && npm ci && VITE_API_BASE=http://localhost:8787 npm run dev
```

Without `VITE_API_BASE` the interface runs in a labelled demo mode: facts come straight from AniList and no model is involved.

Tests: `npm test` in `worker/`, `npm run build` in `web/`, `uv run --project eval --locked python -m pytest eval/tests` for the harness.

## Design

A scroll-driven anime-cinema interface: a dusk hero with a shuffling deck of covers, a samurai guide who walks the page, and claims stamped as verified, conflicting or unchecked. Details in [web/DESIGN.md](web/DESIGN.md) and [docs/SAGA_REFINEMENT.md](docs/SAGA_REFINEMENT.md).

## Extra sources (unmeasured)

Beyond AniList the service can cross-check some fields against Jikan and Wikidata and link to Wikipedia and Reddit searches. This is a product extension, not an evaluated result. Live cross-checks have not been shown to work yet. See [docs/WHY.md](docs/WHY.md).

## Limits, stated now

- AniList blocks direct requests from Cloudflare Workers (HTTP 403, cause unconfirmed), so AniList calls pass through a small Vercel relay. If the relay fails, the service falls back to cached records or the record-only mode.
- The evaluation hands the model the correct AniList record, so it measures grounding, not title search. It uses 18 titles, which is a small sample.
- AniList is the reference, not the truth about anime.
- Free model tiers have daily limits and change without notice. Model and provider IDs are configuration, not code.

## Licence

MIT, see [LICENSE](LICENSE). Anime titles, cover art and metadata belong to their rights holders and come from AniList.
