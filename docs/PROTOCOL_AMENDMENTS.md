# Protocol amendments and execution notes

## 2026-11-06, before model calls: reachable long-tail sample

The registered page 101 (ranks 5001–5050) received HTTP 400 from AniList: `Page depth exceeds maximum allowed for API requests (5000 entries)`. Query, timestamp and sanitized error are retained in `eval/data/raw/*.failure.json`. Head and torso responses had already been cached; no model answers existed. Change the long-tail band to ranks **4501–4550**, page 91 at 50 records/page, within the same filtered FINISHED/non-adult population. Preserve six titles per stratum, seed, all templates, scoring, repeats and success thresholds. This is a less extreme operational long tail and limits generalization to titles beyond the API's pagination ceiling. Commit this amendment before collecting that band or running models.

Timestamps in artifacts are UTC; the registration date is local Asia/Calcutta (2026-11-06), which can correspond to 2026-11-05 UTC.
