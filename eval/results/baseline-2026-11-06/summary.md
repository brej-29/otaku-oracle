# Measured baseline

BLOCKED: invalid provider credential (HTTP 401); model results unavailable; hypothesis threshold cannot pass

Titles: 18; questions: 124; repeats planned: 3; clustered bootstrap: 10,000, seed 20261106.

| Model | Arm | Responses / expected | Attempted | Accuracy (95% CI) | Abstention | Confident wrong | Wrong answer | Parse failure | Missing confidence | Citation validity | Correct + citation |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|
| cohere/north-mini-code:free | A | 0 / 372 | 0 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| cohere/north-mini-code:free | B | 0 / 372 | 1 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| dots-studio/dots-3-note-preview:free | A | 0 / 372 | 0 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| dots-studio/dots-3-note-preview:free | B | 0 / 372 | 1 | N/A N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| deterministic | C | 124 / 124 | 124 | 100.0% [100.0%, 100.0%] | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 100.0% | 100.0% |

A: ungrounded; B: retrieved known-ID record; C: deterministic same-record extraction (consistency ceiling, not independent truth).
Citations are exact canonical-URL matches, not entailment checks. N/A means no response/citation denominator.

| Model / bucket | Complete pairs | B minus A | 95% CI |
|---|---:|---:|---|
| cohere/north-mini-code:free|all | 0 | N/A | N/A |
| cohere/north-mini-code:free|head | 0 | N/A | N/A |
| cohere/north-mini-code:free|long_tail | 0 | N/A | N/A |
| cohere/north-mini-code:free|torso | 0 | N/A | N/A |
| dots-studio/dots-3-note-preview:free|all | 0 | N/A | N/A |
| dots-studio/dots-3-note-preview:free|head | 0 | N/A | N/A |
| dots-studio/dots-3-note-preview:free|long_tail | 0 | N/A | N/A |
| dots-studio/dots-3-note-preview:free|torso | 0 | N/A | N/A |
| pooled|all | 0 | N/A | N/A |
| pooled|head | 0 | N/A | N/A |
| pooled|long_tail | 0 | N/A | N/A |
| pooled|torso | 0 | N/A | N/A |

## Accuracy by bucket

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) |
|---|---|---|---:|---|
| cohere/north-mini-code:free | A | head | 0 / 126 | N/A N/A |
| cohere/north-mini-code:free | A | long_tail | 0 / 120 | N/A N/A |
| cohere/north-mini-code:free | A | torso | 0 / 126 | N/A N/A |
| cohere/north-mini-code:free | B | head | 0 / 126 | N/A N/A |
| cohere/north-mini-code:free | B | long_tail | 0 / 120 | N/A N/A |
| cohere/north-mini-code:free | B | torso | 0 / 126 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | head | 0 / 126 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | long_tail | 0 / 120 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | torso | 0 / 126 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | head | 0 / 126 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | long_tail | 0 / 120 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | torso | 0 / 126 | N/A N/A |
| deterministic | C | head | 42 / 42 | 100.0% [100.0%, 100.0%] |
| deterministic | C | long_tail | 40 / 40 | 100.0% [100.0%, 100.0%] |
| deterministic | C | torso | 42 / 42 | 100.0% [100.0%, 100.0%] |

## Accuracy by kind

| Model | Arm | Slice | Responses / expected | Accuracy (95% CI) |
|---|---|---|---:|---|
| cohere/north-mini-code:free | A | episodes | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | A | format | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | A | main_characters | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | A | season | 0 / 51 | N/A N/A |
| cohere/north-mini-code:free | A | source | 0 / 51 | N/A N/A |
| cohere/north-mini-code:free | A | studio | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | A | year | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | B | episodes | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | B | format | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | B | main_characters | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | B | season | 0 / 51 | N/A N/A |
| cohere/north-mini-code:free | B | source | 0 / 51 | N/A N/A |
| cohere/north-mini-code:free | B | studio | 0 / 54 | N/A N/A |
| cohere/north-mini-code:free | B | year | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | episodes | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | format | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | main_characters | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | season | 0 / 51 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | source | 0 / 51 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | studio | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | A | year | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | episodes | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | format | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | main_characters | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | season | 0 / 51 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | source | 0 / 51 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | studio | 0 / 54 | N/A N/A |
| dots-studio/dots-3-note-preview:free | B | year | 0 / 54 | N/A N/A |
| deterministic | C | episodes | 18 / 18 | 100.0% [100.0%, 100.0%] |
| deterministic | C | format | 18 / 18 | 100.0% [100.0%, 100.0%] |
| deterministic | C | main_characters | 18 / 18 | 100.0% [100.0%, 100.0%] |
| deterministic | C | season | 17 / 17 | 100.0% [100.0%, 100.0%] |
| deterministic | C | source | 17 / 17 | 100.0% [100.0%, 100.0%] |
| deterministic | C | studio | 18 / 18 | 100.0% [100.0%, 100.0%] |
| deterministic | C | year | 18 / 18 | 100.0% [100.0%, 100.0%] |
