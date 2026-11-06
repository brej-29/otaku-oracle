# Answer service contract

The Task 5 request, response fields and error envelopes are implemented without a wire-contract change. POST /api/ask accepts only titleId and question; GET /api/health reports configuration presence, never key validity. A missing provider or spent global budget produces a successful record-only answer.

Verification means equality to the retrieved AniList record, not universal truth. Tagged claims are rendered from their typed values using deterministic text templates: arbitrary draft prose cannot acquire a verified badge by attaching an unrelated matching value. The short model answer is represented by the checked claims rather than echoed as prose; optional explanation is returned only when it passes the deterministic novelty rule, and remains unverified. Unknown/null fields and unavailable record fields are unchecked. Conflicts include recordValue and sourceUrl. Empty claim lists are invalid and trigger fallback.

The frozen value and recordValue types are strings or null. For studio sets these strings contain JSON arrays (for example ["Sunrise","Bones"]); this preserves set boundaries and exact set comparison without ambiguous comma splitting. Numeric values use integer strings. The internal checker also mirrors the evaluator's typed integer and studio-array cases. Model output must be bare JSON; fenced JSON is rejected, matching eval/scoring.py. JSON mode is configured for each provider.

Normalization ports eval/scoring.py: NFKD, Unicode full case folding, alphanumeric-only; exact integers; complete normalized studio set equality. No fuzzy synonyms: autumn conflicts with FALL. Text is never interpreted as HTML. Prompt content and record metadata are untrusted data; system instructions stay separate, and no tools, URLs or user-selected providers are exposed.

D1 owns global atomic counters, a sliding-window 25/minute AniList gate, cross-isolate fetch leases, 24-hour versioned record cache and provider circuits. Duplicate record requests coalesce in-process and wait for the lease owner across isolates. Stale records remain available during upstream outages. Requests fail closed on unavailable D1; they cannot bypass budgets.

## Claim relevance

The canonical reusable keyword map is shared/claim-keywords.json. The Worker imports that single constant (exported as CLAIM_KEYWORDS from worker/src/relevance.ts); the web demo can import the same JSON without depending on Worker bindings. No wire fields change. Single-word keywords match word starts, so animat matches animated and episode matches episodes; multiword how many matches a complete phrase. Matching is case/accent/punctuation normalized. The map covers studio/animat/produc/made; episode/how many/long; year/when/air/start/release; format/movie/film/tv/ova/series; source/based/adapt/manga/novel/original; season.

After strict JSON parsing, keep a model claim only when its field maps to the question OR its value appears as complete normalized words in the short answer. Studio JSON sets require every member to appear. Matching avoids numeric substrings such as 28 inside 1280. Mapped questions return at most four claims; unmappable questions retain at most the first three. Model ordering is preserved; if no claim matches, the model claim list is empty. Dropped claims are discarded, never copied into explanation; optional explanation retains its existing unverified novelty filter. Record-only fallback behavior is unchanged. The transport parser's existing 12-claim safety ceiling remains so padded but valid output can be trimmed; the prompt requests only facts actually stated in the short answer, at most four, without encouraging a minimum count.


## Additive source extension (6 November 2026)

`MULTI_SOURCE_ENABLED=true` enables the extension in the supplied configuration. Without it, the original response and AniList match semantics remain for existing deployments. The request, HTTP error shapes, required response fields, claim field enum and three legacy claim statuses remain unchanged. New clients must check for `resolution`; an old response is an AniList record match, not corroboration.

New optional response fields:

~~~ts
questionKind: "fact" | "news" | "discussion" | "unclear";
resolution: { status: "verified" | "conflict" | "unchecked" | "discussion"; summary: string };
sources: Array<{
  id: string; label: string;
  state: "available" | "stale" | "unavailable" | "rate-limited" | "not-matched" | "link-only";
  url: string; fetchedAt: string | null; cached: boolean; note: string | null;
}>;
related: Array<{
  kind: "news" | "discussion" | "search" | "reference";
  title: string; url: string; source: string; publishedAt: string | null;
  score: number | null; scoreKind: "replies" | null; label: string;
}>;
~~~

Each claim may add `verification: { field, basis, evidence, note }`. Evidence entries carry `{sourceId, source, value, url, fetchedAt, stale}`. Basis is `agreement`, `single-source`, `sources-disagree`, `claim-disagrees`, `insufficient` or `stale`. Arrays such as studios are JSON strings and compare as normalized sets. Integers use the original exact integer normalizer. The visible text is deterministic; arbitrary prose never gains a stamp.

In extended mode, verified requires two distinct fresh catalog IDs agreeing with the claim and no retrieved disagreement. A single fresh AniList source can verify only its own graph, popularity/trending metric, schedule or external/streaming listing, explicitly labelled single-source. These are statements about AniList, not guarantees about a release or regional streaming availability. A lone episode/studio/date match remains unchecked. Stale evidence cannot complete a verification. Sources can share upstream provenance; two catalogs are not proof of two independent primary investigations.

A conflict retains every retrieved source value, including a draft-versus-source conflict. No majority vote silently chooses a winner. Fields outside the legacy six use `field:null` and `verification.field` plus a deterministic text sentence, preserving the old field enum. New fields cover status, runtime, full dates, genres, producers, Japanese main cast, main character count, relations, next scheduled episode, catalog popularity/trending, streaming/external listings and original network when available. Missing or ambiguous values stay unchecked or are omitted.

The fourth state lives in `resolution.status="discussion"`, not the legacy claim status enum. News, opinions and unclear questions return no factual claims, no drafted prose and related links labelled not verified. No model request is spent on these routes. Headlines, dates and reply counts are source metadata only; absent metadata is null. Search links never pretend to be fetched threads. An unclear route explicitly says it could not settle the question. A record-only response can be intentional for source links or deterministic additional fields, rather than a quota failure.

`record` can additionally carry `idMal`, `details` and `resourceLinks`. Exact `idMal` bridges AniList and Jikan; title guessing is disabled. Wikidata requires exactly one entity with only this MAL adaptation ID and no truncated mapping result. Day-level dates require day precision; year-level data cannot verify an exact day. Wikipedia links from Wikidata do not count as another independent evidence vote.

Caching/gates/deadline, source terms, live access failures and optional Reddit access are documented in SOURCES.md. The evaluation remains unchanged and does not measure this extension.
