# Measured baseline

Completed exploratory replication; excluded from primary threshold

Exploratory replication added after primary inference began; cannot rescue or overturn its threshold.

Report snapshot: 2026-11-07T20:31:05.272801+00:00; 1157 complete journal entries included; process state: finished.

Titles: 18; questions: 124; repeats planned: 3; clustered bootstrap: 10,000, seed 20261106.

| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| openai/gpt-oss-120b | A | 372 / 372 | 372 | 57.3% [50.8%, 64.2%] | 15.9% | 21.0% | 26.9% | 0.0% | 0.0% | 30.7% | 23.4% |
| openai/gpt-oss-120b | B | 372 / 372 | 372 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | 124 / 124 | 124 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).
Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.

| Model / bucket | Complete pairs | B minus A | 95% CI |
|---|---:|---:|---|
| openai/gpt-oss-120b / all | 372 | 42.7% | [35.8%, 49.2%] |
| openai/gpt-oss-120b / head | 126 | 24.6% | [15.1%, 35.7%] |
| openai/gpt-oss-120b / long_tail | 120 | 65.8% | [49.2%, 78.1%] |
| openai/gpt-oss-120b / torso | 126 | 38.9% | [31.0%, 48.4%] |
| pooled / all | 372 | 42.7% | [35.8%, 49.2%] |
| pooled / head | 126 | 24.6% | [15.1%, 35.7%] |
| pooled / long_tail | 120 | 65.8% | [49.2%, 78.1%] |
| pooled / torso | 126 | 38.9% | [31.0%, 48.4%] |

## Metrics by bucket

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| openai/gpt-oss-120b | A | head | 126 / 126 | 75.4% [64.3%, 84.9%] | 14.3% | 8.7% | 10.3% | 0.0% | 0.0% | 33.9% | 29.4% |
| openai/gpt-oss-120b | A | long_tail | 120 / 120 | 34.2% [21.9%, 50.8%] | 19.2% | 33.3% | 46.7% | 0.0% | 0.0% | 27.8% | 14.2% |
| openai/gpt-oss-120b | A | torso | 126 / 126 | 61.1% [51.6%, 69.0%] | 14.3% | 21.4% | 24.6% | 0.0% | 0.0% | 29.7% | 26.2% |
| openai/gpt-oss-120b | B | head | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | long_tail | 120 / 120 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | torso | 126 / 126 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | head | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | long_tail | 40 / 40 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | torso | 42 / 42 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

## Metrics by kind

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| openai/gpt-oss-120b | A | episodes | 54 / 54 | 53.7% [33.3%, 74.1%] | 0.0% | 31.5% | 46.3% | 0.0% | 0.0% | 0.0% | 0.0% |
| openai/gpt-oss-120b | A | format | 54 / 54 | 81.5% [70.4%, 94.4%] | 1.9% | 9.3% | 16.7% | 0.0% | 0.0% | 96.1% | 77.8% |
| openai/gpt-oss-120b | A | main_characters | 54 / 54 | 0.0% [0.0%, 0.0%] | 100.0% | 0.0% | 0.0% | 0.0% | 0.0% | N/A | 0.0% |
| openai/gpt-oss-120b | A | season | 51 / 51 | 58.8% [41.2%, 76.5%] | 7.8% | 31.4% | 33.3% | 0.0% | 0.0% | 0.0% | 0.0% |
| openai/gpt-oss-120b | A | source | 51 / 51 | 94.1% [82.4%, 100.0%] | 0.0% | 5.9% | 5.9% | 0.0% | 0.0% | 87.0% | 86.3% |
| openai/gpt-oss-120b | A | studio | 54 / 54 | 50.0% [31.5%, 68.5%] | 0.0% | 38.9% | 50.0% | 0.0% | 0.0% | 6.1% | 1.9% |
| openai/gpt-oss-120b | A | year | 54 / 54 | 64.8% [44.4%, 83.3%] | 0.0% | 29.6% | 35.2% | 0.0% | 0.0% | 0.0% | 0.0% |
| openai/gpt-oss-120b | B | episodes | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | format | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | main_characters | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | season | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | source | 51 / 51 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | studio | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| openai/gpt-oss-120b | B | year | 54 / 54 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | episodes | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | format | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | main_characters | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | season | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | source | 17 / 17 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | studio | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |
| deterministic | C | year | 18 / 18 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

[Sampled error analysis](error-analysis.md); raw responses and all failures remain in the append-only journal.
