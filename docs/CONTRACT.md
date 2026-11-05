# Answer service contract

The Task 5 request, response fields and error envelopes are implemented without a wire-contract change. POST /api/ask accepts only titleId and question; GET /api/health reports configuration presence, never key validity. A missing provider or spent global budget produces a successful record-only answer.

Verification means equality to the retrieved AniList record, not universal truth. Tagged claims are rendered from their typed values using deterministic text templates: arbitrary draft prose cannot acquire a verified badge by attaching an unrelated matching value. The short model answer and optional explanation are returned only in explanation, which is always unverified. Unknown/null fields and unavailable record fields are unchecked. Conflicts include recordValue and sourceUrl. Empty claim lists are invalid and trigger fallback.

The frozen value and recordValue types are strings or null. For studio sets these strings contain JSON arrays (for example ["Sunrise","Bones"]); this preserves set boundaries and exact set comparison without ambiguous comma splitting. Numeric values use integer strings. The internal checker also mirrors the evaluator's typed integer and studio-array cases. Model output must be bare JSON; fenced JSON is rejected, matching eval/scoring.py. JSON mode is configured for each provider.

Normalization ports eval/scoring.py: NFKD, Unicode full case folding, alphanumeric-only; exact integers; complete normalized studio set equality. No fuzzy synonyms: autumn conflicts with FALL. Text is never interpreted as HTML. Prompt content and record metadata are untrusted data; system instructions stay separate, and no tools, URLs or user-selected providers are exposed.

D1 owns global atomic counters, a sliding-window 25/minute AniList gate, cross-isolate fetch leases, 24-hour versioned record cache and provider circuits. Duplicate record requests coalesce in-process and wait for the lease owner across isolates. Stale records remain available during upstream outages. Requests fail closed on unavailable D1; they cannot bypass budgets.
