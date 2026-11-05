# Preregistration: anime fact grounding

Registered 2026-11-06, before dataset collection or model calls. This commit is the immutable analysis plan; later deviations must be recorded separately.

## Problem and hypothesis

People asking anime questions need correct, attributable facts even when using free models. General language models can supply plausible but incorrect studio, episode, date, format, and adaptation metadata. We test whether supplying a retrieved AniList record improves factual accuracy relative to the same model without retrieval. We predict the largest improvement for less popular titles. This evaluates agreement with AniList at the recorded fetch time, not universal truth or unrestricted question answering.

## Sample and arms

Collect 18 completed, non-adult anime: six each from popularity ranks 1–50 (head), 501–550 (torso), and 5001–5050 (long tail), sorted by descending popularity and ascending ID to break ties. Seed 20261106 chooses six candidates per stratum without replacement before inspecting answers; missing eligible facts are skipped, never replaced based on model performance. Snapshot records and query metadata. These deliberately separated rank bands are operational strata, not population quantiles.

Generate seven questions per title when the field is known: main animation studio(s), episode count, start year, format, source material, season, and count of characters labelled MAIN. Unknown/missing or incomplete paginated character records are excluded. Target maximum 126 questions (18 independent title clusters). Report actual sample and exclusions. For studio questions the gold set contains all main studios. Character counts refer only to AniList MAIN edges, not an editorial judgment of protagonists.

Arms: A, model given title, AniList ID for disambiguation, question and output schema; B, identical model with the full fetched record and canonical record citation available; C, deterministic extraction from that same record as a pipeline ceiling. B uses ID retrieval selected by the dataset, so entity resolution is an oracle assumption. Do not describe B as end-to-end search accuracy.

Discover available zero-price :free model IDs at run time from the provider catalog. Use two models, chosen by ID lexical order unless EVAL_MODELS explicitly specifies two catalog-validated IDs before the first call. Archive the selection. Three repeats per question/model/arm at temperature 0.2, maximum 256 output tokens. Randomize title/question order and A/B arm order with the fixed seed; alternate models. Maximum 1512 model calls. C needs one pass. No response-dependent prompt changes, retries with different prompts, cherry-picking, or replacement models after results. Transport retries (at most two) are logged and do not count as independent repeats. On quota failure, stop the affected model, preserve all attempts, report coverage and paired complete subsets. No extrapolated full-run results. A blocked/partial run cannot pass the hypothesis threshold.

## Frozen scoring

Require JSON with answer, confidence (0–1), and citations (list). Null/empty answer is abstention. Invalid output is incorrect and a separate parse failure, not abstention. Numeric fields use integer exact match (no rounding); categorical fields ignore case, Unicode accents, whitespace, underscores and punctuation. Source/format/season accept their normalized enum spelling only. Studio sets use normalized exact set equality, with order ignored; no fuzzy or model-based grading. Each question has equal weight. Report per-type, per-bucket and per-model accuracy; aggregate with equal question weight, averaging three repeats first. Primary accuracy counts abstentions and malformed output as incorrect and excludes API/transport errors from the response denominator; always report attempted/expected/valid-response coverage separately.

Secondary metrics: abstentions / responses; hallucination = wrong non-abstaining answer with explicit numeric confidence >=0.8 / responses; also report wrong-answer rate regardless of confidence, missing confidence and parse failures so confidence gaming is visible. Citation validity = citations exactly matching the question's canonical AniList record URL / all emitted citations (undefined if none); separately report correct answers with at least one valid citation / responses. URL validity is structural attribution, not evidence entailment or an HTTP availability check. C's agreement is a consistency check, not independent validation.

## Inference, success and falsification

Primary comparison is B minus A accuracy on paired question/repeat observations, separately by model and pooled equally across models. Bootstrap 10,000 replicates with seed 20261106, sampling titles with replacement within each stratum and keeping all questions, arms, repeats and models for each title together; use percentile 2.5/97.5 endpoints. This respects repeated-question dependence. Descriptive arm CIs use the same clustered procedure. Small title count limits precision; repeat variation is not an independent title sample.

Success requires a completed two-model, three-repeat run, pooled B–A >=10 percentage points, pooled 95% lower bound >0, and nonnegative point improvement on each model. The long-tail prediction requires its B–A point estimate to exceed each other bucket; report its uncertainty without a second significance claim. A completed run with pooled gain <10 points or interval overlapping zero fails the product threshold; B <= A falsifies the directional hypothesis for this experiment. Failure of long-tail ordering falsifies that sub-hypothesis. Quota failures are feasibility evidence, not evidence for or against accuracy. Publish all results including unfavorable comparisons and limitations.
