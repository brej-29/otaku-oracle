# Lighthouse, proof sheet design (mobile)

Command (from web/, after `npm run build` and `npx vite preview --port 4173`):
`npx lighthouse@12 http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox"` (default mobile profile, simulated throttling, Playwright Chromium via CHROME_PATH).

| Performance | Accessibility | Best practices | SEO |
|---|---|---|---|
| 96 | 100 | 100 | 100 |

Local preview server, not the deployed site. Re-run against the live URL after deploy. Raw report: docs/lighthouse-proof-sheet-mobile.json. JS first load: 120 KB gzip.
