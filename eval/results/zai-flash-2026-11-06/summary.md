# Measured baseline

Completed run; assess preregistered thresholds

Registered primary analysis.

Report snapshot: 2026-11-06T22:52:45.471877+00:00; 1740 complete journal entries included; process state: finished.

Titles: 18; questions: 124; repeats planned: 3; clustered bootstrap: 10,000, seed 20261106.

| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | 372 / 372 | 372 | 54.6% [47.0%, 62.4%] | 0.5% | 44.9% | 44.9% | 0.0% | 0.0% | 0.8% | 0.3% |
| glm-4.7-flash | B | 372 / 372 | 372 | 99.2% [97.6%, 100.0%] | 0.0% | 0.8% | 0.8% | 0.0% | 0.0% | 100.0% | 99.2% |
| glm-4.5-flash | A | 372 / 372 | 372 | 67.2% [59.0%, 75.3%] | 0.0% | 32.8% | 32.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | B | 372 / 372 | 372 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | 124 / 124 | 124 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).
Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.

| Model / bucket | Complete pairs | B minus A | 95% CI |
|---|---:|---:|---|
| glm-4.7-flash / all | 372 | 44.6% | [36.6%, 52.6%] |
| glm-4.7-flash / head | 126 | 33.3% | [24.6%, 42.1%] |
| glm-4.7-flash / long_tail | 120 | 50.8% | [33.3%, 68.3%] |
| glm-4.7-flash / torso | 126 | 50.0% | [38.1%, 61.9%] |
| glm-4.5-flash / all | 372 | 32.8% | [24.7%, 41.0%] |
| glm-4.5-flash / head | 126 | 23.8% | [16.7%, 33.3%] |
| glm-4.5-flash / long_tail | 120 | 55.8% | [35.8%, 75.0%] |
| glm-4.5-flash / torso | 126 | 19.8% | [9.5%, 31.0%] |
| pooled / all | 744 | 38.7% | [31.7%, 46.0%] |
| pooled / head | 252 | 28.6% | [21.8%, 35.3%] |
| pooled / long_tail | 240 | 53.3% | [37.0%, 69.4%] |
| pooled / torso | 252 | 34.9% | [24.2%, 46.0%] |

## Metrics by bucket

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | head | 126 / 126 | 66.7% [57.9%, 75.4%] | 0.0% | 33.3% | 33.3% | 0.0% | 0.0% | 1.5% | 0.8% |
| glm-4.7-flash | A | long_tail | 120 / 120 | 46.7% [30.8%, 64.8%] | 1.7% | 51.7% | 51.7% | 0.0% | 0.0% | 0.8% | 0.0% |
| glm-4.7-flash | A | torso | 126 / 126 | 50.0% [38.1%, 61.9%] | 0.0% | 50.0% | 50.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | B | head | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | long_tail | 120 / 120 | 97.5% [92.5%, 100.0%] | 0.0% | 2.5% | 2.5% | 0.0% | 0.0% | 100.0% | 97.5% |
| glm-4.7-flash | B | torso | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | A | head | 126 / 126 | 76.2% [66.7%, 83.3%] | 0.0% | 23.8% | 23.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | long_tail | 120 / 120 | 44.2% [25.0%, 64.2%] | 0.0% | 55.8% | 55.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | torso | 126 / 126 | 80.2% [69.0%, 90.5%] | 0.0% | 19.8% | 19.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | B | head | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | long_tail | 120 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | torso | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | head | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | long_tail | 40 / 40 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | torso | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

## Metrics by kind

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| glm-4.7-flash | A | episodes | 54 / 54 | 64.8% [44.4%, 83.3%] | 0.0% | 35.2% | 35.2% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | format | 54 / 54 | 87.0% [74.1%, 100.0%] | 0.0% | 13.0% | 13.0% | 0.0% | 0.0% | 3.7% | 1.9% |
| glm-4.7-flash | A | main_characters | 54 / 54 | 13.0% [5.6%, 22.2%] | 3.7% | 83.3% | 83.3% | 0.0% | 0.0% | 1.9% | 0.0% |
| glm-4.7-flash | A | season | 51 / 51 | 47.1% [25.5%, 68.6%] | 0.0% | 52.9% | 52.9% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | source | 51 / 51 | 58.8% [41.2%, 76.5%] | 0.0% | 41.2% | 41.2% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | studio | 54 / 54 | 31.5% [13.0%, 50.0%] | 0.0% | 68.5% | 68.5% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | A | year | 54 / 54 | 79.6% [61.1%, 94.4%] | 0.0% | 20.4% | 20.4% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.7-flash | B | episodes | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | format | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | main_characters | 54 / 54 | 94.4% [83.3%, 100.0%] | 0.0% | 5.6% | 5.6% | 0.0% | 0.0% | 100.0% | 94.4% |
| glm-4.7-flash | B | season | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | source | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | studio | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.7-flash | B | year | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | A | episodes | 54 / 54 | 55.6% [33.3%, 77.8%] | 0.0% | 44.4% | 44.4% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | format | 54 / 54 | 88.9% [77.8%, 100.0%] | 0.0% | 11.1% | 11.1% | 0.0% | 0.0% | N/A | 0.0% |
| glm-4.5-flash | A | main_characters | 54 / 54 | 35.2% [14.8%, 55.6%] | 0.0% | 64.8% | 64.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | season | 51 / 51 | 74.5% [56.9%, 90.2%] | 0.0% | 25.5% | 25.5% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | source | 51 / 51 | 88.2% [76.5%, 100.0%] | 0.0% | 11.8% | 11.8% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | studio | 54 / 54 | 55.6% [33.3%, 77.8%] | 0.0% | 44.4% | 44.4% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | A | year | 54 / 54 | 74.1% [57.4%, 88.9%] | 0.0% | 25.9% | 25.9% | 0.0% | 0.0% | 0.0% | 0.0% |
| glm-4.5-flash | B | episodes | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | format | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | main_characters | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | season | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | source | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | studio | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| glm-4.5-flash | B | year | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | episodes | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | format | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | main_characters | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | season | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | source | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | studio | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | year | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

Completed-coverage preregistered threshold: PASS.
Long-tail point-improvement ordering prediction: supported; no separate significance claim.

[Sampled error analysis](error-analysis.md); raw responses and all failures remain in the append-only journal.
