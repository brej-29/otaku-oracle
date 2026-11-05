import test from "node:test";
import assert from "node:assert/strict";
import { smokeLive, validAnswer } from "./smoke-live.mjs";
const answer = {
  title: "Test title",
  record: {
    id: 154587,
    title: "Test title",
    native: null,
    format: "TV",
    episodes: 28,
    studios: ["MADHOUSE"],
    year: 2023,
    season: "FALL",
    seasonYear: 2023,
    source: "MANGA",
    cover: null,
    color: null,
    url: "https://anilist.co/anime/154587",
    genres: [],
  },
  fetchedAt: "2026-11-06T00:00:00.000Z",
  recordCached: false,
  mode: "model",
  model: { id: "dummy", provider: "dummy" },
  claims: [
    {
      id: "c1",
      text: "Animation studios: MADHOUSE.",
      field: "studio",
      value: '["MADHOUSE"]',
      status: "verified",
      recordValue: '["MADHOUSE"]',
      sourceUrl: "https://anilist.co/anime/154587",
    },
  ],
  explanation: null,
  quota: { state: "ok" },
  notice: null,
};
const urls = { siteUrl: "https://site.example", apiUrl: "https://api.example" };
const json = (body) => new Response(JSON.stringify(body));
test("checks page, health and exactly one POST using mocked fetch only", async () => {
  const calls = [],
    lines = [];
  const net = async (url, init) => {
    calls.push({ url: String(url), init });
    if (calls.length === 1)
      return new Response(
        "<html><title>Otaku Oracle | Source first</title></html>",
      );
    if (calls.length === 2)
      return json({ ok: true, providers: [{ id: "dummy", configured: true }] });
    return json(answer);
  };
  assert.equal(await smokeLive(urls, net, (line) => lines.push(line)), true);
  assert.equal(calls.filter((c) => c.init?.method === "POST").length, 1);
  assert.deepEqual(JSON.parse(calls[2].init.body), {
    titleId: 154587,
    question: "Which studio animated it?",
  });
  assert.equal(calls[2].init.headers.Origin, "https://site.example");
  assert.deepEqual(lines, [
    "site: pass_http_200_expected_title",
    "health: pass_http_200",
    "ask: pass_http_200_contract_verified_studio",
  ]);
});
for (const [label, change] of [
  ["missing record field", (b) => delete b.record.native],
  ["wrong title id", (b) => (b.record.id = 1)],
  ["unchecked studio", (b) => (b.claims[0].status = "unchecked")],
  ["wrong record value", (b) => (b.claims[0].recordValue = '["Other"]')],
  ["wrong field", (b) => (b.claims[0].field = "year")],
  ["wrong source", (b) => (b.claims[0].sourceUrl = "https://other.example")],
  ["invalid model", (b) => (b.model = null)],
  ["invalid timestamp", (b) => (b.fetchedAt = "yesterday")],
  ["invalid quota", (b) => (b.quota.state = "bad")],
])
  test(`rejects ${label}`, () => {
    const b = structuredClone(answer);
    change(b);
    assert.equal(validAnswer(b), false);
  });
test("accepts the contract's record-only fallback", () =>
  assert.equal(
    validAnswer({
      ...answer,
      mode: "record-only",
      model: null,
      explanation: null,
      quota: { state: "exhausted" },
    }),
    true,
  ));
test("fails early on unexpected title, with no POST or raw output", async () => {
  const lines = [];
  let calls = 0;
  assert.equal(
    await smokeLive(
      urls,
      async () => {
        calls++;
        return new Response("<title>Private response payload</title>");
      },
      (line) => lines.push(line),
    ),
    false,
  );
  assert.equal(calls, 1);
  assert.deepEqual(lines, ["site: fail"]);
});
test("prints no upstream body or error text on failure", async () => {
  const lines = [];
  assert.equal(
    await smokeLive(
      urls,
      async () => {
        throw new Error("secret account identifier");
      },
      (line) => lines.push(line),
    ),
    false,
  );
  assert.deepEqual(lines, ["site: fail"]);
});
