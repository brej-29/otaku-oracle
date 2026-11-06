# Field atlas interface

The interface keeps the existing source/answer adapter, sentence helpers and runtime evaluation file. No service credentials belong in this app.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run lint
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

Without VITE_API_BASE this is a clearly labelled record-only demo. It can check studio, episode count, start year, format, source, season and main character count where listed; other questions receive an explicit limitation, not default facts.

For the existing local answer service, run one Worker instance on 8787 with its ignored local secrets, then:

```powershell
$env:VITE_API_BASE = 'http://localhost:8787'
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

The origin must match the Worker's allowed http://localhost:5173. Stop stale server trees before starting another on the same port. The successful integration used a separate inspector port, 9248. A source request times out after 10 seconds and an unreachable answer transport after 20; the service itself has a 15-second deadline. No fallback answer is invented.

## Review and checks

```powershell
$env:VITE_API_BASE = 'http://localhost:8787'
npm.cmd run build
npm.cmd run preview -- --host localhost --port 4178 --strictPort
# In a second terminal:
npm.cmd run check
npm.cmd run shots
node scripts/lighthouse.mjs
```

The review scripts use the installed system browser on Windows. They intercept source/answer requests for the state matrix and visibly label those frames as design review. Source metadata in scripts/fixtures/anilist.json is a timestamped real AniList snapshot; answer/conflict/error payloads are illustrative fixtures. These are not measurement results. The live check is separate: node scripts/e2e-live.mjs makes one real question through the local frontend and Worker, then captures the same answer at all widths. Do not run that repeatedly against tight free quotas.

For the demo truth check, start a separate dev server with VITE_API_BASE empty, then set BASE_URL to it and run node scripts/demo-check.mjs. It verifies abstention and captures an unmatched question without any answer-service calls.

Evidence: ../docs/shots/journey/final/, ../docs/shots/journey/demo/ and ../docs/shots/journey/live/. Performance: ../docs/lighthouse-journey.md. Review and limitations: ../docs/JOURNEY_REVIEW.md. Canonical visual tokens: src/tokens.css and DESIGN.md. All dependency versions are exact and their release dates are recorded in ../docs/dependency-releases.json.
