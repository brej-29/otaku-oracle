# Measured baseline

Incomplete: descriptive observed-response scores only; hypothesis threshold cannot pass; missingness may be biased

Report snapshot: 2026-11-05T20:10:16.635888+00:00; 18 complete journal entries included; process state: running.

Titles: 18; questions: 124; repeats planned: 3; clustered bootstrap: 10,000, seed 20261106.

| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | 4 / 372 | 4 | 25.0% [25.0%, 25.0%] | 0.0% | 75.0% | 75.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | B | 4 / 372 | 4 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | A | 4 / 372 | 4 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | B | 4 / 372 | 4 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | 2 / 124 | 2 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).
Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.

| Model / bucket | Complete pairs | B minus A | 95% CI |
|---|---:|---:|---|
| glm-4.7-flash / all | 4 | 50.0% | [50.0%, 50.0%] |
| glm-4.7-flash / head | 0 | N/A | N/A |
| glm-4.7-flash / long_tail | 3 | 100.0% | [100.0%, 100.0%] |
| glm-4.7-flash / torso | 1 | 0.0% | [0.0%, 0.0%] |
| glm-4.5-flash / all | 4 | 0.0% | [0.0%, 0.0%] |
| glm-4.5-flash / head | 0 | N/A | N/A |
| glm-4.5-flash / long_tail | 3 | 0.0% | [0.0%, 0.0%] |
| glm-4.5-flash / torso | 1 | 0.0% | [0.0%, 0.0%] |
| pooled / all | 8 | 25.0% | [25.0%, 25.0%] |
| pooled / head | 0 | N/A | N/A |
| pooled / long_tail | 6 | 50.0% | [50.0%, 50.0%] |
| pooled / torso | 2 | 0.0% | [0.0%, 0.0%] |

## Metrics by bucket

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | head | 0 / 126 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | long_tail | 3 / 120 | 0.0% [0.0%, 0.0%] | 0.0% | 100.0% | 100.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | torso | 1 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | B | head | 0 / 126 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | long_tail | 3 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | torso | 1 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | A | head | 0 / 126 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | long_tail | 3 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | torso | 1 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | B | head | 0 / 126 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | long_tail | 3 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | torso | 1 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | head | 0 / 42 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | long_tail | 1 / 40 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | torso | 1 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

## Metrics by kind

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | episodes | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | format | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | main_characters | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | season | 4 / 51 | 25.0% [25.0%, 25.0%] | 0.0% | 75.0% | 75.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | source | 0 / 51 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | studio | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | A | year | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | episodes | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | format | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | main_characters | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | season | 4 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | source | 0 / 51 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | studio | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.7-flash | B | year | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | episodes | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | format | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | main_characters | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | season | 4 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | source | 0 / 51 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | studio | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | A | year | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | episodes | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | format | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | main_characters | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | season | 4 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | source | 0 / 51 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | studio | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| glm-4.5-flash | B | year | 0 / 54 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | episodes | 0 / 18 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | format | 0 / 18 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | main_characters | 0 / 18 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | season | 2 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | source | 0 / 17 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | studio | 0 / 18 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | year | 0 / 18 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

[Sampled error analysis](error-analysis.md); raw responses and all failures remain in the append-only journal.
