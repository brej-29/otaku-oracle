# UI design brief (shared by both competing designs)

Product: **Otaku Oracle**, anime questions answered with facts you can check. Models often state wrong anime metadata (studio, episode count, year, source, format). Otaku Oracle looks the title up in AniList first, then answers, and marks every fact as VERIFIED (matches the AniList record, links to it) or UNVERIFIED (model prose, not checked). Whether this beats an ungrounded model is being measured in eval/ (results pending), so the UI must never claim an accuracy number it does not load from data.

## The one job
Pick a title, ask a question, get an answer where verified facts are visibly different from unverified claims, with a one-click path to the AniList source.

## Screens and states to design (all of them)
1. Home/ask: the experience that makes a stranger understand and try it in 10 seconds. Title search (type-ahead, keyboard friendly), question box with example prompts, submit.
2. Answer: streamed or revealed answer, verified fact chips with source links, unverified claims visually distinct, the record card (cover, studio, episodes, year, format), copy and share.
3. Why this exists: scroll-driven story: the problem (models get facts wrong), the check (retrieve then verify), the measurement. It loads `web/public/data/eval-summary.json` at runtime and shows honest status (RUNNING / PARTIAL / COMPLETE, coverage, CIs). If the file says partial, the UI says partial. Never hard-code results.
4. How it works: the pipeline as a custom visual (not a stock diagram).
5. States: loading skeletons, empty, error, offline, slow cold start, rate limited ("quota used up, showing verified facts only"), success.

## Data contract (so the design is real, not mocked up)
- Title search and records: AniList GraphQL https://graphql.anilist.co straight from the browser (free, no key, 30 req/min; debounce and cache).
- `ask(titleId, question)` lives behind one function in `web/src/api.ts`. Until the backend exists it returns a clearly labelled DEMO answer built from the real AniList record (deterministic facts) plus a fixture explanation tagged UNVERIFIED. Show a visible "demo explanation" tag. Never present fixture text as a model result.
- Eval numbers: only from `web/public/data/eval-summary.json` (fixture with status PARTIAL/pending for now, schema: status, updated_at, models[], arms{A,B,C}{accuracy,ci_low,ci_high,responses,expected}, buckets).

## Stack (same for both so the comparison is fair)
Vite + React + TypeScript in `web/`. Motion library `motion` (framer-motion successor) or CSS/WAAPI, your call. CSS variables as design tokens in `web/src/tokens.css`. Self-host fonts (Fontsource), no runtime Google Fonts. No Tailwind required. No 3D by default; canvas/WebGL/shader only where it carries meaning and is lazy-loaded. Total JS budget: aim under 180 KB gzip on first load.

## Quality floor
Responsive 360 to 1920. Keyboard and screen reader support (combobox pattern for search). WCAG AA contrast in every theme. `prefers-reduced-motion` respected with a meaningful static alternative. Lighthouse 90+ on performance, accessibility, best practices, SEO (mobile profile). Every effect earns its place.

## Art direction
Choose ONE strong, distinctive direction and record it in `web/DESIGN.md` (tokens, type scale, palette with contrast ratios, layout grid, motion language: durations, easings, what moves and why, imagery). It must not look like a default template, a generic dark-neon glassmorphism page, or the old Otaku Oracle look. Research best-in-class references (name three real products/sites you studied and what you took from each).

## Deliverables in your worktree branch
- Working app in `web/` (`npm run dev`, `npm run build`), `web/DESIGN.md`.
- `web/scripts/shots.mjs` (Playwright) that writes PNGs to `docs/shots/<name>/{phone-390,tablet-768,desktop-1440}/<screen>.png` for every screen and state above, with reduced-motion variants of the hero.
- Lighthouse mobile scores in `docs/lighthouse-<name>.md` with the command used.
- Commit small and often. No PR yet. No AI attribution anywhere (a commit-msg hook may reject some words; keep messages plain). No secrets. Do not touch eval/ or the Python code.
