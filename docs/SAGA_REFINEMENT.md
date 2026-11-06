# Owner refinement / 6 November 2026

The approved three-card composition, original face and costume remain. Four changes address the owner review:

- One dusk world continues behind the headline and covers. A broad atmospheric veil protects reading at 390, 768 and 1440 px instead of a hard vertical mask.
- A shuffled deck cycles through 32 real bundled titles plus live popular/trending records. One GraphQL request, a six-hour browser metadata cache and module-level request sharing avoid per-card fetches. Visits randomize the deck, with no simultaneous duplicate titles. Hover or keyboard focus pauses; leaving resumes. Incoming images preload with a finite wait; unavailable art keeps an honest title-only cover. Reduced motion retains one still set.
- Note title, studio, episodes and link derive from the same front-title object, changing with its promotion animation. Missing fields show Unlisted. The raw query, timestamp and 32 fallback records are preserved in web/scripts/fixtures/art-source.json.
- Jointed hip/knee/ankle legs replace rigid frames. A 76-unit two-step cycle has 62% stance, passing-foot lift, pelvis bob and arm counter-swing. Road-relative distance drives phase; the illustrated road sets ground height and foot angle. A 75 ms response eases start/stop. An optional validated sprite pack can replace the drawing; [MASCOT_ASSET_SPEC.md](MASCOT_ASSET_SPEC.md) is the complete drop-in contract. No new runtime dependency was added.

## Evidence and checks

Start with [the before/after contact sheet](shots/saga/refinement/contact-sheet.png), [eight successive fronts and their notes](shots/saga/refinement/shuffle-strip.png), and [4x walk samples](shots/saga/refinement/walk-cycle-4x.png). Current heroes cover 390/768/1440 px and dark reduced-motion variants. The before images are prior review captures: exact titles and particle positions differ, so this is a layout comparison rather than a controlled same-image experiment.

Twelve unit tests cover fallback records, deck cycling, normalization/cache expiry, planted stance, segment geometry, reverse movement, manifest rejection and distance-based atlas frames. The new browser suite passed 75 assertions, checking eight distinct synchronized fronts, hover pause/resume, one request, cache reuse, width containment, real scroll-driven phases, stopping/pause, missing fields, 429 fallback and valid/missing/invalid asset packs. Colored test atlases are fixtures, not shipped character artwork. The existing 37 browser assertions passed, including keyboard-only search/submission, all claim states, errors, honest pending progress and runtime evaluation status. The old timed leg-animation assertion now samples during a real scroll gesture: a stopped character should stop walking. No new answer-provider requests were made for this visual refinement.

## Final production measurements

| Profile             | Home | Why | How | Accessibility / best practices / SEO |
| ------------------- | ---: | --: | --: | ------------------------------------ |
| Mobile performance  |   94 |  97 |  98 | 100 on every page                    |
| Desktop performance |   99 | 100 | 100 | 100 on every page                    |

First-load JavaScript is 82.5 KiB gzip, 7.2 KiB above the prior 75.3 KiB build for the metadata, deck and rig/loader. These are local production-preview audits, not field data; remote covers and a randomized initial set vary timings. The earlier 90/96/98 mobile scores remain in the historical review. Current raw reports: docs/lighthouse/saga/; commands and exact size: docs/lighthouse-saga.md.

## Honest critique

The opening now reads as one illustrated setting. At tablet width the source note and courier remain close together. Long note titles use a two-line clamp, retaining complete text in the document and native hover title. Externally hosted cover images can be unavailable offline even though metadata remains usable. At 4x the short legs have readable articulated knees and a lifted passing foot, but remain a stylized 2D walk. Brief start/stop easing is a visual compromise, not a physics simulation. Optional atlas artists must calibrate their own stride and anchor: validation cannot fix poorly drawn walking frames. Physical touch hardware and hardware screen readers remain untested. This refinement does not establish broad answer accuracy or guarantee an award.
