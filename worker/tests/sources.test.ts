import { beforeAll, beforeEach, afterAll, expect, it, vi } from "vitest";
import anilist from "./recorded/anilist.json";
import wikidata from "./recorded/wikidata.json";
import { classify } from "../src/classify";
import { extendAnswer, verify, equalEvidence } from "../src/verification";
import { aniFacts } from "../src/source-record";
import { toRecord } from "../src/anilist";
import {
  malFacts,
  malLinks,
  wikiFacts,
  collectSources,
  searchLinks,
  safeUrl,
} from "../src/sources";
import { handle } from "../src/index";
import { Store } from "../src/storage";
import { Deadline } from "../src/deadline";
import { database, environment, ask } from "./fixtures";
import type { Answer, Claim, Fetcher } from "../src/types";
import type { SourcePayload } from "../src/source-types";
const record = toRecord(anilist.response.data.Media, 154587);
const base: Answer = {
  title: record.title,
  record,
  fetchedAt: new Date().toISOString(),
  recordCached: false,
  mode: "record-only",
  model: null,
  claims: [],
  explanation: null,
  quota: { state: "exhausted" },
  notice: null,
};
const claim = (value = "28"): Claim => ({
  id: "t",
  field: "episodes",
  text: "Episode count: " + value,
  value,
  status: "unchecked",
  recordValue: "28",
  sourceUrl: record.url,
});
const source = (id: string, value: string, stale = false): SourcePayload => ({
  source: {
    id,
    label: id,
    url: "https://example.org/" + id,
    state: stale ? "stale" : "available",
    fetchedAt: new Date().toISOString(),
    cached: false,
    note: null,
  },
  facts: { episodes: value },
  links: [],
});
// Jikan shape fixture follows its opened OpenAPI schema, not a captured live response.
const mal = {
  mal_id: 52991,
  episodes: 28,
  studios: [{ name: "MADHOUSE" }],
  type: "TV",
  source: "Manga",
  status: "Finished Airing",
  duration: "24 min per ep",
  season: "fall",
  aired: { from: "2023-09-29T00:00:00+00:00", to: "2024-03-22T00:00:00+00:00" },
  genres: [{ name: "Adventure" }],
  producers: [],
};
it.each([
  [
    "Which studio animated it and how many episodes?",
    "fact",
    ["studio", "episodes"],
  ],
  ["Any season 3 news?", "news", []],
  ["When is season 3 coming?", "news", []],
  ["Explain the ending", "discussion", []],
  ["Recommend something similar", "discussion", []],
  ["When is the next episode?", "fact", ["next_episode"]],
  ["What is its duration and airing status?", "fact", ["status", "duration"]],
  [
    "Who voices the main characters?",
    "fact",
    ["voice_cast", "main_characters"],
  ],
  ["What about this?", "unclear", []],
])("routes %s deterministically", (q, kind, fields) => {
  expect(classify(q)).toEqual({ kind, fields });
});
it("reads expanded fields from the recorded AniList response", () => {
  expect(record.idMal).toBe(52991);
  expect(aniFacts(record)).toMatchObject({
    episodes: "28",
    status: "FINISHED",
    duration: "24",
    start_date: "2023-09-29",
  });
  expect(record.details?.voice_cast).toContain("Atsumi");
});
it("maps the schema-shaped MAL facts without guessing title identity", () => {
  expect(malFacts(mal, 52991)).toMatchObject({
    episodes: "28",
    duration: "24",
    year: "2023",
    status: "FINISHED",
    studio: '["MADHOUSE"]',
  });
  expect(() => malFacts(mal, 1)).toThrow();
});
it("does not treat empty or unknown source fields as zero", () => {
  expect(malFacts({ mal_id: 1, episodes: null }, 1).episodes).toBeUndefined();
});
it("compares studio sets and accents, integers and dates deterministically", () => {
  expect(
    equalEvidence("studio", '["Mádhouse","bones"]', '["BONES","MADHOUSE"]'),
  ).toBe(true);
  expect(equalEvidence("episodes", "28.0", "28")).toBe(false);
  expect(equalEvidence("episodes", "028", "28")).toBe(true);
  expect(equalEvidence("start_date", "2023-09-29", "2023-09-30")).toBe(false);
});
it("requires two agreeing fresh catalogs", () => {
  expect(verify(claim(), "episodes", [source("anilist", "28")]).status).toBe(
    "unchecked",
  );
  expect(
    verify(claim(), "episodes", [
      source("anilist", "28"),
      source("wikidata", "28"),
    ]).status,
  ).toBe("verified");
});
it("never counts repeated rows from one source as corroboration", () => {
  expect(
    verify(claim(), "episodes", [
      source("anilist", "28"),
      source("anilist", "28"),
    ]).status,
  ).toBe("unchecked");
});
it("shows every source value when catalogs disagree", () => {
  const r = verify(claim(), "episodes", [
    source("anilist", "28"),
    source("mal", "29"),
  ]);
  expect(r.status).toBe("conflict");
  expect(r.verification?.basis).toBe("sources-disagree");
  expect(r.verification?.evidence.map((e) => e.value)).toEqual(["28", "29"]);
});
it("does not hide a wrong drafted value behind source agreement", () => {
  expect(
    verify(claim("99"), "episodes", [
      source("anilist", "28"),
      source("wikidata", "28"),
    ]).verification?.basis,
  ).toBe("claim-disagrees");
});
it("stale evidence cannot complete a verification", () => {
  expect(
    verify(claim(), "episodes", [
      source("anilist", "28"),
      source("mal", "28", true),
    ]).status,
  ).toBe("unchecked");
});
it("null values remain unchecked even if sources agree", () => {
  expect(
    verify({ ...claim(), value: null }, "episodes", [
      source("anilist", "28"),
      source("mal", "28"),
    ]).status,
  ).toBe("unchecked");
});
it("single-source metrics are explicitly catalog-specific", () => {
  const s = source("anilist", "28");
  s.facts = { popularity: "100" };
  const r = verify({ ...claim("100"), field: null }, "popularity", [s]);
  expect(r.verification?.basis).toBe("single-source");
  expect(r.verification?.note).toContain("AniList's own");
});
it("uses the real recorded Wikidata exact-id episode value", () => {
  expect(wikiFacts(wikidata.response).facts.episodes).toBe("28");
  expect(wikiFacts(wikidata.response).facts.start_date).toBeUndefined();
});
it("rejects ambiguous Wikidata identities and imprecise dates", () => {
  const rows = wikidata.response.results.bindings;
  expect(() =>
    wikiFacts({
      results: {
        bindings: [
          ...rows,
          { ...rows[0], item: { value: "http://www.wikidata.org/entity/Q2" } },
        ],
      },
    }),
  ).toThrow();
  expect(wikiFacts(wikidata.response).facts.year).toBeUndefined();
});
it("renders opinion and news as discussion, never factual stamps", () => {
  for (const kind of ["news", "discussion", "unclear"] as const) {
    const r = extendAnswer(
      { ...base, claims: [claim()] },
      kind,
      [],
      [source("mal", "28")],
    );
    expect(r.claims).toEqual([]);
    expect(r.resolution?.status).toBe("discussion");
    expect(r.related?.some((l) => l.source === "Reddit")).toBe(true);
  }
});
it("labels missing sources and does not invent Reddit threads or scores", () => {
  const links = searchLinks(record);
  expect(links.filter((l) => l.source === "Reddit")).toHaveLength(2);
  expect(links.every((l) => l.score === null && l.publishedAt === null)).toBe(
    true,
  );
});
it("sanitizes news/forum links without article text", () => {
  const links = malLinks(
    {
      data: [
        {
          title: "Fixture announcement",
          url: "https://myanimelist.net/news/1",
          date: "2026-01-01",
          comments: 4,
          excerpt: "must not ship",
        },
        { title: "attack", url: "javascript:alert(1)" },
      ],
    },
    "news",
  );
  expect(links).toHaveLength(1);
  expect(links[0]).not.toHaveProperty("excerpt");
  expect(links[0].scoreKind).toBe("replies");
  expect(
    safeUrl("https://myanimelist.net.evil.org/", ["myanimelist.net"]),
  ).toBeNull();
});
let db: D1Database,
  mf: Awaited<ReturnType<typeof database>>["mf"],
  store: Store;
beforeAll(async () => {
  ({ db, mf } = await database());
  store = new Store(db);
});
afterAll(async () => {
  await mf?.dispose();
});
beforeEach(async () => {
  for (const t of [
    "source_cache",
    "source_locks",
    "source_events",
    "records",
    "counters",
    "circuits",
    "leases",
  ])
    await db.prepare("DELETE FROM " + t).run();
});
const net = (status = 200): Fetcher =>
  vi.fn(async (input: RequestInfo | URL) => {
    const u = String(input);
    if (u.includes("graphql.anilist")) return Response.json(anilist.response);
    if (u.includes("jikan"))
      return status === 200
        ? Response.json({ data: mal })
        : Response.json({}, { status, headers: { "Retry-After": "120" } });
    if (u.includes("wikidata")) return Response.json(wikidata.response);
    throw new Error("unexpected network");
  }) as Fetcher;
it("integrates recorded sources without a model call and keeps the contract", async () => {
  const env = environment(db, {
    MULTI_SOURCE_ENABLED: "true",
    MODEL_DAILY_BUDGET: "0",
  });
  const r = await handle(
    ask({ titleId: 154587, question: "How many episodes?" }),
    env,
    net(),
  );
  const body = (await r.json()) as Answer;
  expect(r.status).toBe(200);
  expect(body.claims[0].status).toBe("verified");
  expect(body.claims[0].verification?.evidence).toHaveLength(3);
  expect(body.record.id).toBe(154587);
  expect(body.mode).toBe("record-only");
});
it("fails soft when Jikan rate limits, with an independent recorded cross-check", async () => {
  const r = await handle(
    ask({ titleId: 154587, question: "How many episodes?" }),
    environment(db, { MULTI_SOURCE_ENABLED: "true", MODEL_DAILY_BUDGET: "0" }),
    net(429),
  );
  const body = (await r.json()) as Answer;
  expect(r.status).toBe(200);
  expect(body.sources?.find((s) => s.id === "mal")?.state).toBe("unavailable");
  expect(body.claims[0].status).toBe("verified");
  expect(await store.circuit("source:mal")).toBeGreaterThan(
    Date.now() + 100000,
  );
});
it("uses a source cache across repeated requests", async () => {
  const f = net(),
    env = environment(db),
    deadline = new Deadline(Date.now() + 6000);
  try {
    await collectSources(record, "fact", env, store, f, deadline);
    await collectSources(record, "fact", env, store, f, deadline);
    expect(vi.mocked(f).mock.calls).toHaveLength(2);
  } finally {
    deadline.close();
  }
});
it("serves stale evidence on outage and labels it stale", async () => {
  const env = environment(db),
    deadline = new Deadline(Date.now() + 6000);
  try {
    await collectSources(record, "fact", env, store, net(), deadline);
    await db.prepare("UPDATE source_cache SET expires_at=0").run();
    await db.prepare("DELETE FROM source_events").run();
    const values = await collectSources(
      record,
      "fact",
      env,
      store,
      vi.fn().mockRejectedValue(new Error("offline")) as Fetcher,
      deadline,
    );
    expect(values.every((v) => v.source.state === "stale")).toBe(true);
  } finally {
    deadline.close();
  }
});
it("enforces zero daily budget without any source fetch", async () => {
  const f = net(),
    deadline = new Deadline(Date.now() + 1000);
  try {
    const values = await collectSources(
      record,
      "fact",
      environment(db, { SOURCE_DAILY_BUDGET: "0" }),
      store,
      f,
      deadline,
    );
    expect(f).not.toHaveBeenCalled();
    expect(values.every((v) => v.source.state === "unavailable")).toBe(true);
  } finally {
    deadline.close();
  }
});
it("does not guess a missing MAL identifier", async () => {
  const f = net(),
    deadline = new Deadline(Date.now() + 1000);
  try {
    const values = await collectSources(
      { ...record, idMal: null },
      "fact",
      environment(db),
      store,
      f,
      deadline,
    );
    expect(f).not.toHaveBeenCalled();
    expect(values.every((v) => v.source.state === "not-matched")).toBe(true);
  } finally {
    deadline.close();
  }
});
it("bounds a source that ignores abort and returns unavailable", async () => {
  const deadline = new Deadline(Date.now() + 45);
  try {
    const values = await collectSources(
      record,
      "fact",
      environment(db),
      store,
      (() => new Promise(() => {})) as Fetcher,
      deadline,
    );
    expect(values.every((v) => v.source.state === "unavailable")).toBe(true);
  } finally {
    deadline.close();
  }
});
it("does not spend the model budget on discussion links", async () => {
  const f = vi.fn(async (input: RequestInfo | URL) =>
    String(input).includes("anilist")
      ? Response.json(anilist.response)
      : Response.json({
          data: [
            {
              title: "Fixture discussion",
              url: "https://myanimelist.net/forum/?topicid=1",
              comments: 4,
              date: "2026-01-01",
            },
          ],
        }),
  ) as Fetcher;
  const r = await handle(
    ask({ titleId: 154587, question: "Explain the ending" }),
    environment(db, { MULTI_SOURCE_ENABLED: "true" }),
    f,
  );
  const body = (await r.json()) as Answer;
  expect(body.resolution?.status).toBe("discussion");
  expect(body.related?.find((l) => l.kind === "discussion")?.label).toBe(
    "Discussion, not verified",
  );
  expect(
    vi.mocked(f).mock.calls.every(([u]) => !String(u).includes("example/v1")),
  ).toBe(true);
});

it("keeps expanded retrieval out of the compact drafting prompt", async () => {
  let prompt = "";
  const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const u = String(input);
    if (u.includes("anilist")) return Response.json(anilist.response);
    if (u.includes("jikan")) return Response.json({ data: mal });
    if (u.includes("wikidata")) return Response.json(wikidata.response);
    prompt = String(init?.body);
    return Response.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              answer: "There are 28 episodes.",
              claims: [
                { text: "28 episodes.", field: "episodes", value: "28" },
              ],
              explanation: null,
            }),
          },
        },
      ],
    });
  }) as Fetcher;
  const r = await handle(
    ask({ titleId: 154587, question: "How many episodes?" }),
    environment(db, { MULTI_SOURCE_ENABLED: "true" }),
    f,
  );
  expect(r.status).toBe(200);
  expect(prompt).not.toBe("");
  expect(prompt).not.toContain("voice_cast");
  expect(prompt).not.toContain("resourceLinks");
  expect(((await r.json()) as Answer).record.details?.voice_cast).toBeDefined();
});
