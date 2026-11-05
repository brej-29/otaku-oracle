import { writeFile } from "node:fs/promises";
const base = new URL(process.env.TIMING_URL ?? "http://127.0.0.1:8792");
if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname))
  throw new Error("Local Worker only");
const rows = [];
for (let index = 1; index <= 5; index++) {
  const start = performance.now();
  try {
    const response = await fetch(new URL("/api/ask", base), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleId: 154587,
        question: "Which studio animated it?",
      }),
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.json();
    const row = {
      request: index,
      http: response.status,
      elapsedMs: Math.round(performance.now() - start),
      mode: body.mode ?? null,
      quota: body.quota?.state ?? null,
      provider: body.model?.provider ?? null,
      explanation: body.explanation === null ? "omitted" : "present",
    };
    rows.push(row);
    console.log(JSON.stringify(row));
  } catch {
    const row = {
      request: index,
      http: null,
      elapsedMs: Math.round(performance.now() - start),
      status: "network_or_timeout",
    };
    rows.push(row);
    console.log(JSON.stringify(row));
  }
}
const times = rows.map((r) => r.elapsedMs).sort((a, b) => a - b),
  summary = {
    count: rows.length,
    minMs: times[0],
    medianMs: times[2],
    maxMs: times.at(-1),
  };
const result = {
  at: new Date().toISOString(),
  scope:
    "Local Wrangler with real providers; five serial requests; no answer bodies saved",
  rows,
  summary,
};
await writeFile(
  new URL("../../docs/timing-worker-2026-11-06.json", import.meta.url),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(summary));
