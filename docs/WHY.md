# Why this project, and the hard questions

Numbers below come from the run summaries in `eval/results/` (registered run complete 2026-11-06 22:52 UTC; exploratory runs as stated in the table). The generated `summary.md` in each results folder is the source of truth and supersedes this page. The pass mark was fixed in [PREREGISTRATION.md](PREREGISTRATION.md) before any model answered.

## The claim in one paragraph

Chat models answer anime metadata questions (studio, episode count, start year, format, source, season, number of main characters) in a confident voice and are often wrong. If the model is given the AniList record first, and each claim it makes is then compared to that record by exact rules, the reader gets facts they can trust and a visible mark of which ones were checked. The evaluation asks how much the record helps. The product shows the check.

## What the data says so far

| Run | Model | Role | Answers done | A (ungrounded) | B (grounded) | B minus A, 95% CI |
|---|---|---|---:|---:|---:|---|
| zai-flash | glm-4.5-flash | registered primary | 744 / 744 | 67.2% | 100.0% | 32.8 pts [24.7, 41.0] |
| zai-flash | glm-4.7-flash | registered primary | 744 / 744 | 54.6% | 99.2% | 44.6 pts [36.6, 52.6], 372 pairs |
| replication-groq | gpt-oss-120b | exploratory | 744 / 744 | 57.3% | 100.0% | 42.7 pts [35.8, 49.2], 372 pairs |
| replication-nvidia | gemma-4-31b-it | exploratory | 744 / 744 | 62.9% | 100.0% | 37.1 pts [29.9, 44.2], 372 pairs |

- The registered threshold (pooled gain of at least 10 points, lower bound above 0, both models, three repeats) **passes**: pooled B minus A is 38.7 points, 95% CI [31.7, 46.0], on 744 complete pairs (`eval/results/zai-flash-2026-11-06/summary.md`). The pass says grounding helps these free models on these seven fields. It does not say the record is true, and arm B is a ceiling.
- Exploratory runs are never pooled into the primary result.
- Bucket pattern, registered pooled result: gain is 28.6 pts for head titles, 34.9 for torso and 53.3 for long tail. This is the ordering the long-tail prediction gave. The title sample is 18, so the intervals are wide (long tail [37.0, 69.4]).

## The hard questions

**1. Why is this a real problem and not a toy?**
Because the failure is measurable and silent. In the ungrounded arm every wrong answer from the GLM models carried a stated confidence of at least 0.8 (confident-wrong equals wrong-answer in the table: 32.8% and 44.9%). Nothing in the output warns the reader. Source: `eval/results/zai-flash-2026-11-06/summary.md`.

**2. Grounded accuracy is 100%. Isn't that trivial, since the answer is in the prompt?**
Yes, largely, and it should be read that way. Arm B tests whether a free model copies a fact from a supplied record correctly. It shows a ceiling, not cleverness. The informative number is arm A: roughly one answer in three is wrong without the record. I do not claim arm B proves general retrieval quality.

**3. If the record holds the answer, why is a model needed at all? Arm C already scores 100%.**
For these seven fields a deterministic lookup is enough, and arm C shows it. The model adds free-form questions ("who made it?") that map onto fields. I have not measured how well the model maps questions to fields on open phrasing. The relevance filter (`docs/CONTRACT.md`) limits the damage by dropping claims that do not fit the question, but that is a guard, not a measurement.

**4. Why does arm C scoring 124/124 not count as evidence?**
Arm C and the gold answers come from the same record through the same extraction code. Agreement shows the extractor and scorer are consistent. It does not show the record is true. The preregistration labels it a consistency check.

**5. Is AniList the truth?**
No. It is the reference. A claim marked "verified" means it equals the AniList record fetched at that time. The interface says so, and the README lists it under limits.

**6. Only 18 titles. Why should anyone believe it?**
They should be cautious. There are 124 questions but only 18 independent title clusters, so the bootstrap resamples titles within each band, not questions. The intervals are wide for that reason (for example long tail, `glm-4.7-flash`, 0 to 100). Seed, bands and thresholds were fixed before collection.

**7. You changed the plan. Why trust the rest?**
Every change is dated in [PROTOCOL_AMENDMENTS.md](PROTOCOL_AMENDMENTS.md) and was committed before the affected data existed, except one that is labelled as after the fact:
- Long tail moved from ranks 5001-5050 to 4501-4550 because AniList rejects pagination past 5000 entries (raw failure kept in `eval/data/raw`).
- Models changed from two OpenRouter free IDs to two Z.ai models, before any model answer, after the OpenRouter key returned 401.
- Groq and NVIDIA runs were added **after** the Z.ai run started and are labelled exploratory, outside the threshold.

**8. Two models from one family is weak. Why?**
Because they were the only two verified free and responding when the run started. The amendment says so. The two exploratory runs from other families (Groq, NVIDIA) are the replication, and both show the same direction. They are incomplete.

**9. What did not work?**
- First run: both OpenRouter models returned 401. Zero answers. Archived untouched in `eval/results/blocked-openrouter-2026-11-06/`.
- `glm-4.7-flash`: repeated 429 with business code 1305 (overload). Four checks of five passed in calibration, and service availability never became reliable.
- Groq: a local quota pause stops the run at a daily token cap, so coverage accumulates slowly.
- Z.ai wrapped JSON in Markdown fences until JSON mode was enabled. The scorer was not relaxed, since fenced output stays a parse failure.
- Early readouts from a handful of answers showed gains near 50 points. They were noise and are not cited.

**10. What stops the checker from rubber-stamping a claim?**
Claims arrive as typed `{field, value}` pairs. The visible sentence is rendered from the typed value with fixed templates, so prose cannot pick up a "verified" badge by sitting next to an unrelated matching number. Integers must match exactly, text is normalised, studios compare as full sets. "Autumn" conflicts with "FALL". No model grades another model. Source: `docs/CONTRACT.md`, `worker/src/checker.ts`.

**11. What happens when providers fail or the budget runs out?**
The Worker tries providers in healthy-first order with an 8 second limit each and a 15 second total deadline. If every provider fails or the daily model budget is spent, it answers from the record alone and says so. If the storage layer is unavailable, requests fail closed instead of bypassing budgets.

**12. How is abuse limited on a free tier?**
Per-client daily limit 50, global model budget 100 per day, a global 25 per minute AniList gate, CORS limited to one origin. These are configuration in `worker/wrangler.toml`. They bound cost to zero because only free models are configured, but they also bound availability: when the budget is spent, the product degrades to record-only answers.

**13. Why a Cloudflare Worker and not the original Django app?**
The original was a dead deployment (the Railway URL returned 404), shipped 21 MB of 3D models, and its model IDs had all left the catalog. A Worker with D1 gives atomic counters and a free tier. The Python code remains, offline, for the evaluation. Details in [ARCHITECTURE.md](ARCHITECTURE.md).

**14. Is the model's stated confidence useful?**
Not in the ungrounded arm. For the GLM models every wrong answer was stated with confidence at or above 0.8. Groq's model abstained on 15.9% of ungrounded answers, which is the only abstention behaviour seen. Confidence is therefore not used for any decision in the product. Verification against the record is.

**15. What would prove this wrong?**
Preregistered: a completed run where the pooled gain is under 10 points or the interval touches zero, or B at or below A. Also the long-tail ordering failing. Beyond that: a larger title sample where head titles show the same 56 point gain would break the popularity story, and a field outside these seven fields where the record is silent would show the limit of the approach, since those claims stay unchecked.

## What is not done yet

- All four runs are complete. The Groq run finished after a local daily quota pause; it is exploratory and not pooled.
- Live site: https://otaku-oracle.brejesh-bala.workers.dev, API on a Cloudflare Worker with AniList calls relayed through a free Vercel function (AniList returned 403 to Cloudflare Workers directly).
- Cross-checking against Jikan and Wikidata has not been shown on live data.
- Lighthouse was last measured before the cover row and claim states were added (mobile 96, 100, 100, 100). It must be re-run on the final build.


## Unmeasured source extension / 6 November 2026

The multi-source checker and news/discussion links are a product extension, not an evaluated result. The preregistered experiment measures AniList grounding only. It does not measure cross-catalog identity, source independence, source disagreement, routing quality, announcements or discussion relevance. Recorded-fixture tests establish software behavior, not factual accuracy. Two catalogs can copy from common upstream material; disagreement may reflect edition or taxonomy differences. The new interface separates corroboration, explicit single-source catalog data, unchecked claims and discussion links.
