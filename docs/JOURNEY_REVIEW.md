DEGRADED: single-context (task requires solo work).

# Journey review

Questions were skipped under the owner's explicit creative delegation. This is a solo review of the supplied product brief and captured interface, not independent audience research or a guarantee of an award.

## Direction and reference critique

The illustrated field atlas makes checking a fact feel like following a trail. A new compass-eye mark, italic wordmark, paper/forest/vermilion palette and original leaf-hooded traveller replace the previous visual system. The traveller walks the actual source path on scroll, notices typing, thinks during a pending answer, celebrates checked claims and becomes puzzled on an error. It has no layout footprint. The visible pause control and system reduced-motion preference leave it in a still pose.

The strongest reference's virtual camera travels through a deep world. This implementation carries that continuity into three horizontally and diagonally travelling foreground scenes, with slower distant scenery and a faster near layer. Native document scrolling remains usable. Portrait screens retain one continuous landscape but prioritise readable, vertically flowing controls. The second reference informed the cream/charcoal/red mood and generous chapter typography; the third informed a restrained framed stage. All production drawings and text are original. Reference captures are study evidence, not shipped assets.

The strongest moment is the route from the immediate working question desk through three contrasting paper claim states to the source. The answer view deliberately settles into a quieter journal. A verified seal, a struck-through conflict with an explicit correction, and an open unchecked mark cannot be mistaken for one another by colour alone. Record-only output and demo limitations remain plainly labelled.

## Iterations made from captures

1. The first capture pass exposed foreground scenery competing with introductory copy and an awkward mobile traveller position. A paper fade now protects reading, scenery sits behind the working surfaces, and the mobile guide has a dedicated resting area. The new identity and source trail survived this simplification.
2. The next pass exposed the guide crossing reading surfaces, a heading-level jump in the How diagram and a three-pixel tablet overflow in the Why ornament. The guide now sits in the scene depth behind the paper foreground, answer/secondary pages give it intentional resting positions, heading order is sequential, and the ornament is inset. Final captures at all three widths report no horizontal overflow or runtime errors. Dark answer captures were refreshed after their lazy source covers loaded.

The historical pass folders remain evidence of iteration. The final folder is authoritative.

## Product and interaction verification

- 35 browser assertions passed: all three claim states, record-only fallback, rate/offline/upstream errors without substituted claims, keyboard-only search/selection/submission, visible motion pause, static reduced-motion pose, real offline banner, walking and thinking poses, honest pending verification, cancellation with the question preserved, and all three runtime evaluation statuses.
- Five demo assertions passed: studio-only, two-field questions, main-character count, unsupported-question abstention and explicit demo labelling. The unsupported question is captured at 390, 768 and 1440 pixels.
- The final matrix contains 55 images: 42 primary screen/state captures, nine dark/reduced-motion captures and four panorama stages. The primary matrix reports zero overflow/runtime failures. Light and dark are captured at 390, 768 and 1440 pixels.
- One unmocked question through localhost:5173 and the existing local answer service on localhost:8787 returned HTTP 200 in 2,544 ms, with two of two claims verified, MADHOUSE present in the source record and no page runtime errors. The same answer was captured at all three widths without making more answer requests. Earlier local attempts stalled behind duplicate service process trees; the successful run followed their cleanup. This single smoke is availability evidence, not factual-accuracy measurement or a latency distribution.
- Build/type checks and lint passed. The dependency audit found zero vulnerabilities. All eleven direct dependency versions are exact and their published dates precede the two-week cutoff. No motion or 3D framework was added. A single markup heuristic scan returned no findings; its scope is narrower than a full accessibility or visual review.

Loading stages follow real events: source retrieval, a pending service response, then returned claims. There are no timer-driven assertions that drafting or verification has finished. Cancellation is available. The source transport has a ten-second timeout and the answer transport twenty seconds, allowing the service's fifteen-second deadline to respond.

The Why page reads the evaluation file at runtime. Current published data is PENDING. Test-only PARTIAL/COMPLETE examples are visibly labelled illustrative and never published as results. AniList attribution and "AniList is the reference, not the truth" remain visible.

## Measured budgets

| Profile | Home | Why | How | Accessibility / best practices / SEO |
|---|---:|---:|---:|---|
| Mobile performance | 98 | 98 | 99 | 100 / 100 / 100 on every page |
| Desktop performance | 100 | 100 | 100 | 100 / 100 / 100 on every page |

These are local production-build audits, not field data. First-load JavaScript is 72.4 KiB gzip. Raw reports and reproduction commands are linked in [the performance record](lighthouse-journey.md). Normal text token pairs exceed 4.5:1: light muted text 5.01:1, light accent 5.47:1, dark muted 8.52:1 and dark accent 6.53:1. Keyboard focus has a visible outline; motion can be stopped without hiding content.

## Self-assessment and remaining weaknesses

Subjective scores: art direction 9/10, motion 9/10, task clarity 9/10, accessibility within tested scope 9/10. The distinctive traveller, editorial typography and continuous route make this a coherent product identity rather than a generic landing page.

The world uses flat illustrated planes; its depth is less volumetric than the strongest reference. Some secondary annotations are deliberately small and could become more generous in a future readability pass. Physical touch-device behaviour, hardware screen readers and native share sheets have not been tested. The real smoke covers one title and one question; wider source availability and provider quotas remain service constraints. These are limitations, not completed checks.

Disposition: ready for review within the captured scope. No independent design jury, exhaustive device coverage or broader accuracy result is claimed. Preview instructions are in [web/README.md](../web/README.md).
