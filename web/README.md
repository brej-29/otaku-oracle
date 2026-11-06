# Dusk cinema interface

Warm editorial paper, real AniList cover art and a live night-festival world. The original courier has eight authored walk frames, pointer-aware eyes and distinct input/loading/success/error poses. The native document scroll drives a three-scene horizontal/diagonal camera; no wheel or touch input is intercepted. The visible pause control and system reduced-motion preference produce a complete still poster sequence.

## Run

~~~powershell
npm.cmd ci
$env:VITE_API_BASE = 'http://localhost:8787'
npm.cmd run dev -- --host localhost --port 5173 --strictPort
~~~

Run only one local answer Worker on 8787. With no VITE_API_BASE the demo reads seven source fields and abstains on unmatched questions. No keys belong in this client.

## Checks and captures

~~~powershell
$env:VITE_API_BASE = 'http://localhost:8787'
npm.cmd run build
npm.cmd run lint
npm.cmd run preview -- --host localhost --port 4178 --strictPort
# Separate terminal, production preview still running:
npm.cmd run check
npm.cmd run shots
node scripts/motion-check.mjs
node scripts/lighthouse.mjs
~~~

The state matrix uses visibly labelled fixtures; the source snapshots contain real metadata, not drafted answers. The live script makes one real answer request through localhost:5173 and 8787, then captures that one response at all three widths. Do not repeatedly run it against the shared free allowance.

For a separate empty-VITE_API_BASE dev server, set BASE_URL to that server and run node scripts/demo-check.mjs. To reproduce a critique pass against localhost:5173, set PASS to a new pass name and run node scripts/review.mjs. The scripts use the installed system browser on Windows.

Evidence: ../docs/shots/saga/, ../docs/lighthouse-saga.md and ../docs/SAGA_REVIEW.md. Deployment commands: ../docs/DEPLOY.md. Runtime evaluation data remains the existing public/data/eval-summary.json; its state and numbers are never invented by the UI.

## Weight

React and its renderer are the only production dependencies. Existing typed API/sentence helpers remain. CSS and native scroll coordinate the camera, canvas particles stop outside the viewport, and the journey artwork mounts near the viewport. Tiny starter images use source-sized thumbnails; full hero art is discovered early. All eleven direct package versions are exact and older than the two-week cutoff; see ../docs/dependency-releases.json. Audit and browser packages are development-only.
