# Journey capture index

- `final/`: authoritative final screen/state matrix at 390, 768 and 1440 pixels. `manifest.json` records the 42 primary captures and their overflow/runtime checks; dark, reduced-motion and panorama frames bring the total to 55 images.
- `demo/`: unsupported demo question at all three widths. No answer-service calls and no substituted default answer.
- `live/`: three views of the same real local answer, with status-only timing/count evidence in `status.json`. `diagnostic.png` records an earlier stalled local attempt; it is not a successful answer.
- `pass-1/`, `pass-2/`: historical iteration captures, not the final visual state.
- `references/`: the three requested sites opened in a real browser, including wheel-driven camera study. These are reference evidence, not production assets.

The review matrix intercepts source and answer traffic. Source metadata comes from the timestamped AniList snapshot in `web/scripts/fixtures/anilist.json`; response/error payloads are illustrative fixtures. Review frames display a visible fixture label. They are not factual-accuracy measurements. The live and demo folders are separate from those fixtures.

See [review and limitations](../../JOURNEY_REVIEW.md), [performance](../../lighthouse-journey.md) and [reproduction commands](../../../web/README.md).
