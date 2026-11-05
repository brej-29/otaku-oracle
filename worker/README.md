# Checked anime answers

Cloudflare Worker entry: src/index.ts. Contract and trust boundary: ../docs/CONTRACT.md. Local/deployment commands, free-tier protections and source links: ../docs/DEPLOY.md. Test/live status evidence: ../docs/WORKER_VERIFICATION.md.

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

POST /api/ask takes `{ "titleId": 1, "question": "How many episodes?" }`. Successful responses always include the source record and claim states; model outage or budget exhaustion returns successful record-only facts. GET /api/health reports configured providers without exposing credentials. Explanation is unverified prose, even when nearby claims match the source.

Provider order, model ids, endpoints, allowlists and request options are in providers.json (or the optional PROVIDERS_JSON Worker variable). Secrets come only from bindings; .dev.vars is ignored. The live smoke command is deliberately separate from tests and makes one request per configured provider: npm run smoke. No output bodies are logged.
