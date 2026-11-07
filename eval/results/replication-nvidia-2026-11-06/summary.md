# Measured baseline

Completed exploratory replication; excluded from primary threshold

Exploratory replication added after primary inference began; cannot rescue or overturn its threshold.

Report snapshot: 2026-11-06T09:20:44.239634+00:00; 882 complete journal entries included; process state: finished.

Titles: 18; questions: 124; repeats planned: 3; clustered bootstrap: 10,000, seed 20261106.

| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| google/gemma-4-31b-it | A | 372 / 372 | 372 | 62.9% [55.8%, 70.1%] | 0.0% | 37.1% | 37.1% | 0.0% | 0.0% | 28.3% | 23.9% |
| google/gemma-4-31b-it | B | 372 / 372 | 372 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | 124 / 124 | 124 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).
Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.

| Model / bucket | Complete pairs | B minus A | 95% CI |
|---|---:|---:|---|
| google/gemma-4-31b-it / all | 372 | 37.1% | [29.9%, 44.2%] |
| google/gemma-4-31b-it / head | 126 | 19.0% | [14.3%, 28.6%] |
| google/gemma-4-31b-it / long_tail | 120 | 63.3% | [47.5%, 77.0%] |
| google/gemma-4-31b-it / torso | 126 | 30.2% | [19.0%, 42.9%] |
| pooled / all | 372 | 37.1% | [29.9%, 44.2%] |
| pooled / head | 126 | 19.0% | [14.3%, 28.6%] |
| pooled / long_tail | 120 | 63.3% | [47.5%, 77.0%] |
| pooled / torso | 126 | 30.2% | [19.0%, 42.9%] |

## Metrics by bucket

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| google/gemma-4-31b-it | A | head | 126 / 126 | 81.0% [71.4%, 85.7%] | 0.0% | 19.0% | 19.0% | 0.0% | 0.0% | 29.5% | 27.8% |
| google/gemma-4-31b-it | A | long_tail | 120 / 120 | 36.7% [23.0%, 52.5%] | 0.0% | 63.3% | 63.3% | 0.0% | 0.0% | 31.7% | 22.5% |
| google/gemma-4-31b-it | A | torso | 126 / 126 | 69.8% [57.1%, 81.0%] | 0.0% | 30.2% | 30.2% | 0.0% | 0.0% | 24.0% | 21.4% |
| google/gemma-4-31b-it | B | head | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | long_tail | 120 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | torso | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | head | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | long_tail | 40 / 40 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | torso | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

## Metrics by kind

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| google/gemma-4-31b-it | A | episodes | 54 / 54 | 61.1% [44.4%, 77.8%] | 0.0% | 38.9% | 38.9% | 0.0% | 0.0% | 0.0% | 0.0% |
| google/gemma-4-31b-it | A | format | 54 / 54 | 92.6% [81.5%, 100.0%] | 0.0% | 7.4% | 7.4% | 0.0% | 0.0% | 87.0% | 81.5% |
| google/gemma-4-31b-it | A | main_characters | 54 / 54 | 20.4% [5.6%, 37.0%] | 0.0% | 79.6% | 79.6% | 0.0% | 0.0% | 16.7% | 1.9% |
| google/gemma-4-31b-it | A | season | 51 / 51 | 58.8% [41.2%, 76.5%] | 0.0% | 41.2% | 41.2% | 0.0% | 0.0% | 0.0% | 0.0% |
| google/gemma-4-31b-it | A | source | 51 / 51 | 92.2% [80.4%, 100.0%] | 0.0% | 7.8% | 7.8% | 0.0% | 0.0% | 94.1% | 86.3% |
| google/gemma-4-31b-it | A | studio | 54 / 54 | 55.6% [33.3%, 77.8%] | 0.0% | 44.4% | 44.4% | 0.0% | 0.0% | 0.0% | 0.0% |
| google/gemma-4-31b-it | A | year | 54 / 54 | 61.1% [50.0%, 70.4%] | 0.0% | 38.9% | 38.9% | 0.0% | 0.0% | 0.0% | 0.0% |
| google/gemma-4-31b-it | B | episodes | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | format | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | main_characters | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | season | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | source | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | studio | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| google/gemma-4-31b-it | B | year | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | episodes | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | format | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | main_characters | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | season | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | source | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | studio | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | year | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

[Sampled error analysis](error-analysis.md); raw responses and all failures remain in the append-only journal.
