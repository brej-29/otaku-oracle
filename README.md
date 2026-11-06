# Otaku Oracle

Anime answers where every fact is checked against its AniList record and stamped. Facts that match get a seal. Facts that contradict the record are struck through, with the record's value shown. Anything that cannot be checked stays in pencil.

Status: the product works locally end to end. It is not deployed yet. The evaluation is partly done: the registered pass or fail for the central claim is **blocked**, not decided, because one of the two registered models (`glm-4.7-flash`) has only 16% of its answers. Early descriptive numbers and every hard question are answered in [docs/WHY.md](docs/WHY.md).

| Evidence so far (partial, descriptive) | Ungrounded | Grounded in the record |
|---|---:|---:|
| `glm-4.5-flash`, complete run | 67.2% | 100.0% |
| `gpt-oss-120b`, exploratory, 49% done | 57.1% | 100.0% |
| `gemma-4-31b-it`, exploratory, 55% done | 66.0% | 100.0% |

Grounded accuracy is a ceiling, since the record holds the answer. The informative number is the ungrounded one: roughly one answer in three is wrong, and the wrong ones are stated with confidence.

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

The interface uses real manga materials as its meaning system: blue pencil for unchecked, black ink for checked, a red hanko seal for verified. See [web/DESIGN.md](web/DESIGN.md) and the screenshots under `docs/shots/`.

## Limits, stated now

- Accuracy numbers appear in the interface only when they load from a completed evaluation file. Until then the page says so.
- The evaluation hands the model the correct AniList record, so it measures grounding, not title search. It uses 18 titles, which is a small sample.
- AniList is the reference, not the truth about anime.
- Free model tiers have daily limits and change without notice. Model and provider IDs are configuration, not code.

## Licence

MIT, see [LICENSE](LICENSE). Anime titles, cover art and metadata belong to their rights holders and come from AniList.
