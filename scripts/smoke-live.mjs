import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x) => typeof x === "string" && x.trim().length > 0;
const nullable = (x) => x === null || typeof x === "string";
const integer = (x) => x === null || (Number.isSafeInteger(x) && x >= 0);
const strings = (x) =>
  Array.isArray(x) && x.every((v) => typeof v === "string");
const url = (x) => {
  try {
    return text(x) && new URL(x).protocol === "https:";
  } catch {
    return false;
  }
};
const fields = new Set([
  null,
  "studio",
  "episodes",
  "year",
  "format",
  "source",
  "season",
]);
export function validAnswer(b) {
  if (
    !object(b) ||
    !text(b.title) ||
    !object(b.record) ||
    typeof b.recordCached !== "boolean" ||
    !text(b.fetchedAt) ||
    !/^\d{4}-\d\d-\d\dT/.test(b.fetchedAt) ||
    !Number.isFinite(Date.parse(b.fetchedAt)) ||
    !["model", "record-only"].includes(b.mode) ||
    !nullable(b.explanation) ||
    !nullable(b.notice) ||
    !object(b.quota) ||
    !["ok", "degraded", "exhausted"].includes(b.quota.state)
  )
    return false;
  const r = b.record;
  if (
    r.id !== 154587 ||
    !text(r.title) ||
    !nullable(r.native) ||
    !nullable(r.format) ||
    !integer(r.episodes) ||
    !strings(r.studios) ||
    !integer(r.year) ||
    !nullable(r.season) ||
    !integer(r.seasonYear) ||
    !nullable(r.source) ||
    !nullable(r.cover) ||
    !nullable(r.color) ||
    !strings(r.genres) ||
    r.url !== "https://anilist.co/anime/154587"
  )
    return false;
  if (
    b.mode === "model"
      ? !object(b.model) || !text(b.model.id) || !text(b.model.provider)
      : b.model !== null ||
        b.explanation !== null ||
        b.quota.state !== "exhausted"
  )
    return false;
  if (
    !Array.isArray(b.claims) ||
    b.claims.length === 0 ||
    !b.claims.every(
      (c) =>
        object(c) &&
        text(c.id) &&
        text(c.text) &&
        fields.has(c.field) &&
        nullable(c.value) &&
        nullable(c.recordValue) &&
        ["verified", "conflict", "unchecked"].includes(c.status) &&
        url(c.sourceUrl) &&
        c.sourceUrl === r.url,
    )
  )
    return false;
  return b.claims.some((c) => {
    if (c.status !== "verified" || c.field !== "studio") return false;
    if (c.recordValue === "MADHOUSE") return true;
    try {
      const studios = JSON.parse(c.recordValue);
      return strings(studios) && studios.includes("MADHOUSE");
    } catch {
      return false;
    }
  });
}
export async function smokeLive(
  { siteUrl, apiUrl, expectedTitle = "Otaku Oracle" },
  fetcher = fetch,
  write = console.log,
) {
  let stage = "configuration";
  try {
    const site = new URL(siteUrl),
      api = new URL(apiUrl);
    if (
      ![site, api].every(
        (u) =>
          ["http:", "https:"].includes(u.protocol) &&
          !u.username &&
          !u.password,
      ) ||
      !text(expectedTitle)
    )
      throw new Error();
    stage = "site";
    const page = await fetcher(site, { signal: AbortSignal.timeout(10000) });
    if (page.status !== 200) throw new Error();
    const html = await page.text(),
      title = html
        .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        ?.replace(/&(?:nbsp|#160);/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!title?.toLowerCase().includes(expectedTitle.toLowerCase()))
      throw new Error();
    write("site: pass_http_200_expected_title");
    stage = "health";
    const health = await fetcher(new URL("/api/health", api), {
      signal: AbortSignal.timeout(10000),
    });
    const status = await health.json();
    if (
      health.status !== 200 ||
      status?.ok !== true ||
      !Array.isArray(status.providers) ||
      !status.providers.every(
        (p) => object(p) && text(p.id) && typeof p.configured === "boolean",
      )
    )
      throw new Error();
    write("health: pass_http_200");
    stage = "ask";
    // Exactly one POST, with no retry; response bodies are checked, never printed.
    const answer = await fetcher(new URL("/api/ask", api), {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: site.origin },
      body: JSON.stringify({
        titleId: 154587,
        question: "Which studio animated it?",
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (answer.status !== 200 || !validAnswer(await answer.json()))
      throw new Error();
    write("ask: pass_http_200_contract_verified_studio");
    return true;
  } catch {
    write(`${stage}: fail`);
    return false;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (
    !(await smokeLive({
      siteUrl: process.env.SITE_URL,
      apiUrl: process.env.API_URL,
      expectedTitle: process.env.EXPECTED_TITLE ?? "Otaku Oracle",
    }))
  )
    process.exitCode = 1;
}
