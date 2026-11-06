DEGRADED: single-context (the task requires solo work).
disposition: ship

## persistence

Ready for the owner's visual review within the captured scope. This is a solo review, not independent design-jury approval. The explicit creative delegation and rejected prior design are recorded in PRODUCT.md and SAGA_DIRECTION.md. The finished tokens and behaviour are documented in web/DESIGN.md and web/design-tokens.json. No evaluation or answer-service source files changed.

The final matrix has 69 images at 390, 768 and 1440 pixels: 42 primary screen/state captures, nine travelling scenes, nine light/dark/reduced hero/answer variants and nine static scene views. The primary matrix reports zero horizontal overflow and zero page runtime errors. A late capture exposed two not-yet-decoded remote covers; all nine final hero variants were recaptured only after all three images decoded successfully. The contact sheet uses these refreshed captures.

37 interaction assertions passed, including keyboard-only search/selection/submission, all three claim states, fallback and errors, a still reduced-motion character, walking/thinking poses, honest pending verification, cancellation and the three runtime evaluation statuses. Five separate demo checks passed, including unsupported-question abstention and main-character count. Loading/state captures use labelled fixtures; they are not model accuracy measurements.

Two controlled local answer requests succeeded through localhost:5173 and the single Worker on 8787: 1,592 ms initially and 1,809 ms after the visual refinements. Both returned HTTP 200, two verified claims out of two, a matching source studio, record-only false and no page errors. Each returned answer was captured at all three widths without additional answer calls. The final phone companion offset was adjusted after the live capture; the current labelled fixture frames and position assertion show its corrected clearance. Two final-preview navigation attempts failed before any API request because a Windows file-watcher error had stopped the frontend; excluding capture scripts from that watcher resolved the failure. These are functional smoke checks, not a latency distribution or proof of broad factual accuracy.

Final production audits:

| Profile             | Home | Why | How | Other three categories |
| ------------------- | ---: | --: | --: | ---------------------- |
| Mobile performance  |   90 |  96 |  98 | 100 on every page      |
| Desktop performance |  100 | 100 | 100 | 100 on every page      |

The first homepage audit scored 80 mobile and 94 desktop; it failed the required mobile floor. Deferring near-viewport artwork, using source-sized thumbnails and discovering the hero image earlier removed the avoidable initial image load. An intermediate optimized run scored 97 mobile; the table reports the later final backend-connected build rather than selecting the highest result. Local scores vary with the external art connection. First-load JavaScript is 75.3 KiB gzip. Build/type checks passed; the install audit found zero vulnerabilities. The eleven exact web dependency versions were verified older than the two-week cutoff.

## fidelity

| Promise                   | Evidence and verdict                                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anime is immediate        | Match: explicit anime headline, three real hero covers, real title starter row and attributed cover/banner planes through the world.                                                                                                                         |
| Warm field-journal base   | Match: editorial serif and italic accent, paper/ink, red, tilted source note, human invitation and a working desk.                                                                                                                                           |
| Living background         | Match: motion.json records changed cloud and lantern matrices and a changed canvas image while idle; pause leaves all three unchanged.                                                                                                                       |
| A travelling camera       | Match within the chosen 2D medium: nine consecutive frames travel from x=0 to x=-2880 and y=0 to y=-40 at desktop width, with scenery/gate layers at different rates.                                                                                        |
| Strong original companion | Match in tested views: hero scale is 245 px desktop and 195 px phone; eight authored walk frames, coat/tail motion, pointer-aware eyes and distinct curious/thinking/happy/puzzled poses. Four-times renders were inspected across all three rebuild passes. |
| Three claim states        | Match: solid red verified seal and brief petal burst; conflict cross/strike/correction; unchecked open dashed treatment. Prose beyond the record never receives a verified seal.                                                                             |
| Product truth             | Match: arbitrary title search and free-text question use the existing contract; demo limitations, runtime evaluation status and record-only/error states remain explicit.                                                                                    |
| Still poster and keyboard | Match in recorded checks: system reduction and pause stop movement; content remains complete, focus visible and the combobox usable by keys.                                                                                                                 |

References opened and studied in the browser:

- [Liquid Ink immersive experience](https://www.liquidink.design/github_web/): continuous camera, separated near/far layers and a character inside the world. The native page is one viewport high; wheel behaviour was studied separately.
- [Samurai Saga](https://dearfuture-samuraisaga.webflow.io/): dramatic value, large type and a strong accent.
- [MekaVerse](https://themekaverse-ijbd.webflow.io/): bold framed composition, a small influence.

Reference screenshots appear beside the final scenes in contact-sheet.png. No reference code, artwork or text is used in production. Title imagery is the requested AniList hot-linked art, with query and timestamp snapshots preserved.

## ceiling

The result is a 2D cel-shaded cinema world. Its depth is flatter and less volumetric than the strongest reference. The courier is deliberately playful; it may feel younger than the dramatic scenery. Some secondary captions and source annotations remain small. The phone performance score is at the required floor, with less headroom than the simpler previous design. Physical touch hardware, hardware screen readers and native share sheets have not been tested. One local smoke does not establish provider availability for other titles or at production scale.

Measured normal-text token contrast: light ink 13.83:1, muted 5.70:1 and red 5.51:1; dark muted 9.06:1 and red 9.05:1. World cream is 13.66:1 and gold 8.82:1 against the dusk ground. Readable overlays protect text where imagery crosses behind it. These token calculations and automatic audits are narrower than exhaustive manual accessibility certification.

## material_fixes

| Critique/rebuild pass  | Finding                                                                                                   | Change and final disposition                                                                                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One                    | Retained paper wash flattened the dusk; phone art appeared too late; first face lacked distinction.       | Removed the wash, moved art and companion into the first phone view, redrew forehead/cheek/shadow details. Resolved in pass two and final frames.                                                                                                                       |
| Two                    | Bright moon crossed closing type; mobile banner crossed supporting copy; the headline did not name anime. | Protected reading, moved the banner, committed the anime headline and strengthened the near gate/camera plane. Resolved in pass three and final frames.                                                                                                                 |
| Three                  | Loading still felt like a plain card; the Why ornament overflowed; long phone questions were too narrow.  | Added the selected-title cinema/loading companion, red seals and petal burst, real cover ornament and full-width question type. The final matrix reports no overflow. A reduced-motion mount edge case was also fixed so all three static scenes exist on initial load. |
| Final capture validity | Some remote covers had not decoded at capture time.                                                       | Added explicit image readiness; nine settled hero variants were recaptured, and all nine still scenes were captured individually to avoid a stitched sticky-header artifact. The contact sheet was refreshed. Resolved.                                                 |

The single source heuristic scan flagged two coloured side borders in the lantern-rib drawing. They are decorative ribs inside an original lantern, not an accent border on a UI card; this is a contextual false positive. No second scan or independent reviewer is claimed.

The final real phone capture also exposed the companion touching a long heading. Its offset was moved upward and a geometric browser assertion now verifies clearance; the nine affected phone frames were refreshed without more provider calls.

No open material finding remains in the pictured scope. This disposition does not promise an award or physical-device coverage.

## keep

Keep the real anime art, expressive large courier, warm invitation and living night camera together; keep the answer view quieter, the distinctions honest and the source one click away. Review the actual images rather than this description: docs/shots/saga/contact-sheet.png and docs/shots/saga/scroll-strip.png. Preview and deployment commands are in web/README.md and docs/DEPLOY.md.

## Owner refinement / 6 November 2026

The owner subsequently identified four material gaps: the opening had a hard left/right seam, the covers never changed, the source note was fixed to one title, and the walking legs were too stiff. Those findings supersede the earlier no-open-finding statement for that reviewed version. The fixes and new evidence are in [SAGA_REFINEMENT.md](SAGA_REFINEMENT.md), with a before/after contact sheet in shots/saga/refinement/. The original three rebuild passes above remain historical, not evidence that this later feedback had already been implemented.
