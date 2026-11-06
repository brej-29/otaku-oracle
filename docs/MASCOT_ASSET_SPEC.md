# Nori asset pack

The built-in illustrated courier is the default. An optional transparent sprite atlas can replace it without changing components or the answer contract. No animation dependency is downloaded.

## Install

1. Put a transparent PNG or WebP atlas in `web/public/mascot/`, for example `courier.webp`.
2. Replace `web/public/mascot/manifest.json` with the manifest below. Paths are relative to that folder. Rebuild and publish normally; for local development, reload the page.
3. To restore the built-in courier, use `{ "version": 1, "enabled": false }`. A missing manifest, invalid manifest, missing image, timeout or wrong image dimensions also keeps the built-in courier. The page reserves the same footprint while loading.

Only PNG/WebP sprite atlases are supported. Export other authoring formats into an atlas; no vector-player or proprietary animation runtime is required.

## Example manifest

```json
{
  "version": 1,
  "image": "courier.webp",
  "frame": { "width": 256, "height": 320 },
  "columns": 8,
  "rows": 8,
  "anchor": { "x": 0.5, "y": 0.94516129 },
  "facing": "right",
  "walkStride": 160,
  "animations": {
    "walk": {
      "frames": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      "fps": 16,
      "loop": true
    },
    "idle": {
      "frames": [16, 17, 18, 19, 20, 21, 22, 23],
      "fps": 8,
      "loop": true
    },
    "look": {
      "frames": [24, 25, 26, 27, 28, 29, 30, 31],
      "fps": 10,
      "loop": true
    },
    "think": {
      "frames": [32, 33, 34, 35, 36, 37, 38, 39],
      "fps": 8,
      "loop": true
    },
    "celebrate": {
      "frames": [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51],
      "fps": 16,
      "loop": false
    },
    "puzzled": {
      "frames": [52, 53, 54, 55, 56, 57, 58, 59],
      "fps": 10,
      "loop": false
    }
  }
}
```

Frames are zero-based, left to right, then top to bottom. The example is a 2048 by 2560 atlas, with four unused cells. All six animation names are required. A non-looping pose holds its final frame until the state changes. Idle, look, think, celebrate and puzzled follow elapsed time; walking follows actual road distance, so `fps` is metadata for the walk rather than a timer. `walkStride` is the horizontal travel in native frame pixels per complete two-step cycle. Calibrate it to planted-foot motion in the art. Reversing scroll reverses facing; the built-in rig also reverses its distance phase.

`anchor` is the normalized planted-foot origin within every frame, shared across all animations. Keep it fixed. It is aligned to the built-in ground point at 50% width and 94.516129% height; sprite proportions are preserved and may extend beyond the box. Transparent padding must keep ears, props and jumping poses inside each cell. No baked-in floor or moving shadow: the feet must land at the shared anchor. Recommended first pack: 256 by 320 cells, 16 walking frames, crisp outlined cel shading and a small palette. Preserve the original face, scarf and silhouette unless a replacement is explicitly commissioned. Preview at normal size and 4x.

## Limits and fallback

Each cell must be 16-1024 px per dimension; grid dimensions 1-32; complete atlas at most 4096 px per dimension and 8 million pixels. Recommend compressed size below 1.5 MiB (checked by the asset author, not a network-size guarantee). Every animation has 1-128 valid frame indexes, 1-60 fps and an explicit Boolean `loop`. `walkStride` must be 8-1024. Facing is `left` or `right`. Anchor components must be finite numbers in [0,1]. Only same-origin `.png` and `.webp` files below `/mascot/` are accepted; no query strings, fragments, remote hosts or parent-directory escapes. The decoded image must exactly match cell size times grid size. Manifest and image loading each have a four-second deadline. The shipped disabled manifest intentionally requests no atlas.

Reduced motion or the visible pause control selects the first idle frame with no frame loop. Offscreen atlases stop updating. The built-in fallback is visible until a complete pack passes validation. Missing art never blocks title search or an answer.

## Walk acceptance

Draw contact, down, passing and up on each side, with a clear hip/knee/ankle chain. Hold a planted foot fixed relative to the ground throughout stance; lift the passing foot, counter-swing the arms, and keep the head readable with a small pelvis bob. Test slow and fast scroll, reverse travel, stop/start, narrow layouts and reduced motion. An atlas cannot repair a sliding walk: match its stance travel to `walkStride`.

The included default uses a 76-unit two-step cycle, 62% stance, 28/29-unit thigh/shin lengths and inverse-kinematic knees. Its foot stays at the road position during steady stance; a 75 ms easing response blends into and out of the resting pose. The ground follows the illustrated road rather than an unrelated viewport baseline.

## Verify locally

From `web/`, run `npm run test:unit`, `npm run build`, then preview. `node scripts/refinement-check.mjs` tests valid, missing and invalid packs using test-only colored frames, plus resize and still-mode behavior. Visual evidence is in `docs/shots/saga/refinement/`. The test atlas is not shipped as character art.
