# Wanderer and source evidence / 6 November 2026

UI: design/saga, PR #7. Answer extension: feat/sources, PR #8. The approved editorial layout, continuous dusk world, randomized three-card deck and synchronized source notes remain. No deployment or new account was created; evaluation files and running evaluation processes were untouched.

## Character and identity

The owner-supplied atlas is rendered at every companion location: hero, journey, question/answer, waiting, error and How. The display name is exported once as COMPANION_NAME. The new topknot/blade seal, stacked serif wordmark, favicon and social image share that identity. Missing/invalid/slow assets retain a neutral samurai silhouette with the same reserved footprint. Previous character art, current-product screenshots and the unused leg rig were removed. Actual catalog metadata can still contain the legitimate studio name WHITE FOX; that is a factual source value, not a mascot reference.

The supplied 352 by 320 / 4 by 5 atlas uses its documented foot anchor and 288-native-pixel stride. All visible foot baselines were measured at source row 302 (one at 303), matching the manifest anchor. Walk frames follow actual travel distance, reverse facing follows scroll, and stop returns to idle. The hero alone has transform breathing, pointer-facing, glance, thought, focus gesture and a rare quiet draw during a 26-second active cycle. Hidden tabs/offscreen heroes suspend their activity; pause and reduced motion show one idle pose. The loader remains generic for any validated PNG/WebP manifest.

A frame-sized canvas paints only changed frames or resize. The decoded atlas is reused across poses, avoiding an asynchronous image event at every pose change. Breathing and facing use compositor transforms; canvas frames are capped at 2x pixel density. The original supplied artwork remains unchanged.

## Source experience and truth

Expandable source chips show availability. Corroborated values carry evidence links. Disagreements keep equal side-by-side values; there is no silent majority winner. A lone, stale or insufficient catalog match remains unchecked. AniList-owned metrics, graph, link listings and schedule can be explicitly single-source. Legacy/demo one-record matches have neutral styling and never look independently corroborated.

News, discussion and unclear routes use a different violet conversation shelf. Titles, outlet, date and reply count appear only when returned by an adapter; search links are clearly searches. No invented thread metadata or article text is shown. The demo remains explicitly limited to its original seven live record fields. The backend route supports richer fields, but keyword routing is English and can miss novel phrasing. The evaluation remains AniList grounding only; it does not measure this extension.

Sources retained: AniList, a fail-soft exact-ID Jikan adapter, narrowly mapped Wikidata and optional Wikipedia reference links. Reddit is search-links-only because current official data access requires explicit approval. Kitsu and direct news ingestion were rejected because current access/terms could not be verified. Opened policies and full reasons are in SOURCES.md.

## Verification

- Worker: 159 tests, including the original suite, recorded AniList/Wikidata responses and explicitly schema-shaped Jikan fixtures. No live calls in CI; type/format checks and dry-run build pass.
- UI: 9 unit tests; 49 companion assertions at 390/768/1440; 101 source-state assertions; 37 existing keyboard/product assertions. The screen/state matrix has zero recorded overflow/runtime failures. Hero-action time is advanced for its authored timer tests; walking is separately checked with native scroll/time. These are software tests, not measured answer accuracy.
- Source-only live checks returned 200 in 3359, 619 and 526 ms, all with two unchecked claims and secondary adapters unavailable. No model was called. A separate direct public Wikidata probe returned one adaptation and 28 episodes; that does not establish Worker adapter availability. All three negative smoke files are retained in PR #8. Further local retries were stopped.

## Audits and iterations

| Audit batch                  | Mobile Home / Why / How | Desktop Home / Why / How | Other categories |
| ---------------------------- | ----------------------- | ------------------------ | ---------------- |
| Initial supplied-atlas image | 83 / 98 / 99            | 98 / 100 / 100           | All 100          |
| Final frame-sized renderer   | 92 / 98 / 98            | 94 / 100 / 100           | All 100          |

These are local production-preview measurements, not field data. The failed 83 homepage score is retained in lighthouse-samurai-first.json; current raw reports and exact bundle size are in lighthouse/saga/ and lighthouse-saga.md. Final JavaScript is 82.4 KiB gzip, with no new dependency. The supplied atlas is about 842 KiB and is not included in that JavaScript figure. The homepage's measured cumulative layout shift is zero.

The first source-layout pass exposed a four-pixel phone overflow from the decorative atlas and a companion head under the review header. Its bounds were inset, its phone scale/position adjusted and every decorative sprite layer made non-interactive. The next review corrected a cramped conversation heading to a full-width two-line composition. Incoming metadata also shifted starter-row height during the journey; starters are now fixed for the visit while the hero still consumes the live shuffled pool. A timing-sensitive virtual-clock walk check was replaced with native scrolling, keeping clock advancement only for intentional idle actions.

One mechanical design pass reported the existing decorative lantern rib borders and palette/radius documentation advisories. The ribs belong to the approved world, not a UI accent card. New conversation colors/radius are documented. No clean-detector or independent review certification is claimed. The product context retains its earlier document format; a schema migration was outside this task.

## Visual evidence and preview

Start with shots/saga/contact-sheet.png, shots/saga/hero-action-strip.png and shots/saga/samurai/pose-strip.png. Final screenshots cover 390/768/1440, dark and reduced motion, all companion poses, claims, source disagreement/stale/unavailable states, news/discussion/unclear shelves, loading/errors and Why/How. Response illustrations are visibly labelled fixtures, not results. Current images replace obsolete product-character screenshots.

Preview: http://localhost:5173, using the source Worker on 8788. From sources/worker run `npm run dev -- --port 8788 --var MODEL_DAILY_BUDGET:0` for key-free source-only review; .dev.vars needs a local IP_HASH_SECRET of at least 16 characters. From design-saga/web set VITE_API_BASE=http://localhost:8788, then run `npm run dev -- --host localhost --port 5173 --strictPort`. One older Worker may remain on 8787; do not start a duplicate. Normal drafted answers require the existing configured free provider secrets and normal model budget. No deployment was performed.

## Honest self-review

The supplied character has a stronger human silhouette and the quiet actions fit the approved world. The source comparison is readable and distinct from conversation links. It still falls short of a continuous hand-animated character: eight authored walk frames have discrete contact changes, so this is calibrated distance playback, not a claim of perfectly interpolated foot physics. The hero has breathing and pose changes rather than independent hair/cloth layers. The atlas adds real download weight. The tablet note/companion spacing remains close, and long source titles can clamp. Network availability is the largest product weakness: neither secondary adapter was established by the local Worker smoke, so no live corroboration claim is justified. Physical touch hardware and hardware screen readers remain untested. The result is ready for visual/code review, not an asserted award or production availability guarantee.
