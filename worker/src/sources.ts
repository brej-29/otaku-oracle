import type { Deadline } from "./deadline";
import { readLimited } from "./parse";
import { retryAt } from "./providers";
import { daily, Store } from "./storage";
import type { AnimeRecord, Env, Fetcher } from "./types";
import type {
  EvidenceField,
  QuestionKind,
  RelatedLink,
  SourceInfo,
  SourcePayload,
} from "./source-types";
const UA = "OtakuOracle/1.0 (https://github.com/brej-29/otaku-oracle)";
const flights = new WeakMap<object, Map<string, Promise<SourcePayload>>>();
const iso = (now = Date.now()) => new Date(now).toISOString();
export function safeUrl(value: unknown, hosts: string[]): string | null {
  try {
    if (typeof value !== "string") return null;
    const u = new URL(value);
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      hosts.includes(u.hostname)
      ? u.href
      : null;
  } catch {
    return null;
  }
}
function blank(
  id: string,
  label: string,
  url: string,
  state: SourceInfo["state"],
  note: string,
): SourcePayload {
  return {
    source: { id, label, url, state, note, cached: false, fetchedAt: null },
    facts: {},
    links: [],
  };
}
async function cachedSource(
  key: string,
  id: string,
  label: string,
  url: string,
  ttl: number,
  env: Env,
  store: Store,
  deadline: Deadline,
  operation: (signal: AbortSignal) => Promise<SourcePayload>,
): Promise<SourcePayload> {
  let map = flights.get(store.db);
  if (!map) {
    map = new Map();
    flights.set(store.db, map);
  }
  const existing = map.get(key);
  if (existing) return deadline.run(() => existing, 6000);
  const run = async () => {
    const row = await store.db
      .prepare(
        "SELECT payload,fetched_at,expires_at FROM source_cache WHERE key=?",
      )
      .bind(key)
      .first<{ payload: string; fetched_at: number; expires_at: number }>();
    const previous = row ? (JSON.parse(row.payload) as SourcePayload) : null;
    if (row && previous && row.expires_at > Date.now())
      return { ...previous, source: { ...previous.source, cached: true } };
    const fallback = (
      state: SourceInfo["state"],
      note: string,
    ): SourcePayload =>
      previous
        ? {
            ...previous,
            source: { ...previous.source, state: "stale", cached: true, note },
          }
        : blank(id, label, url, state, note);
    if (deadline.remaining < 150)
      return fallback(
        "unavailable",
        "Unavailable now: request deadline reached.",
      );
    if ((await store.circuit("source:" + id)) > Date.now())
      return fallback(
        "rate-limited",
        "Unavailable now: source cooldown is active.",
      );
    const budget =
        env.SOURCE_DAILY_BUDGET === undefined
          ? 500
          : Number(env.SOURCE_DAILY_BUDGET),
      period = daily(Date.now());
    if (!Number.isSafeInteger(budget) || budget < 0 || budget > 5000)
      return fallback(
        "unavailable",
        "Source budget configuration is unavailable.",
      );
    if (!(await store.consume("sources:" + period.day, budget, period.end)))
      return fallback(
        "unavailable",
        "Unavailable now: the shared daily source budget is spent.",
      );
    const locked = await store.db
      .prepare(
        "INSERT INTO source_locks(key,until_ms) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET until_ms=excluded.until_ms WHERE until_ms <= ? RETURNING key",
      )
      .bind(key, Date.now() + 6500, Date.now())
      .first();
    if (!locked)
      return fallback(
        "unavailable",
        "Unavailable now: this source is already refreshing.",
      );
    try {
      const now = Date.now();
      const limit = id === "mal" ? 30 : 20;
      const permit = await store.db.batch([
        store.db
          .prepare("DELETE FROM source_events WHERE at_ms <= ?")
          .bind(now - 60000),
        store.db
          .prepare(
            "INSERT INTO source_events(id,source,at_ms) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM source_events WHERE source=? AND at_ms>?) < ? AND (SELECT COUNT(*) FROM source_events WHERE source=? AND at_ms>?) < 1 RETURNING id",
          )
          .bind(
            crypto.randomUUID(),
            id,
            now,
            id,
            now - 60000,
            limit,
            id,
            now - 1100,
          ),
      ]);
      if (!permit[1].results.length)
        return fallback(
          "rate-limited",
          "Unavailable now: the shared source rate gate is busy.",
        );
      const value = await deadline.run(
        operation,
        id === "wikidata" ? 5500 : 3000,
      );
      await store.db
        .prepare(
          "INSERT INTO source_cache(key,payload,fetched_at,expires_at) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,fetched_at=excluded.fetched_at,expires_at=excluded.expires_at",
        )
        .bind(key, JSON.stringify(value), Date.now(), Date.now() + ttl)
        .run();
      return value;
    } catch {
      return fallback(
        "unavailable",
        "Unavailable now: the source did not return usable data.",
      );
    } finally {
      await store.db
        .prepare("DELETE FROM source_locks WHERE key=?")
        .bind(key)
        .run();
    }
  };
  const pending = run();
  map.set(key, pending);
  try {
    return await pending;
  } finally {
    map.delete(key);
  }
}
async function json(
  url: string,
  fetcher: Fetcher,
  store: Store,
  id: string,
  signal: AbortSignal,
): Promise<any> {
  const r = await fetcher(url, {
    headers: { Accept: "application/json", "User-Agent": UA },
    signal,
    redirect: "error",
  });
  if (r.status === 429 || r.status === 503) {
    await store.openCircuit(
      "source:" + id,
      retryAt(r.headers.get("Retry-After"), Date.now(), 60),
    );
    await r.body?.cancel();
    throw new Error("source_cooldown");
  }
  if (!r.ok) {
    await r.body?.cancel();
    throw new Error("source_unavailable");
  }
  return JSON.parse(await readLimited(r, 200000, signal));
}
const add = (
  facts: Partial<Record<EvidenceField, string>>,
  key: EvidenceField,
  value: unknown,
) => {
  if (typeof value === "string" && value && value !== "[]")
    facts[key] = value.slice(0, 6000);
  else if (Number.isSafeInteger(value) && Number(value) >= 0)
    facts[key] = String(value);
};
const set = (xs: any[]) =>
  JSON.stringify(
    [
      ...new Set(
        xs.filter((s): s is string => typeof s === "string" && s.length > 0),
      ),
    ].slice(0, 30),
  );
export function malFacts(
  m: any,
  id: number,
): Partial<Record<EvidenceField, string>> {
  if (m?.mal_id !== id) throw new Error("identity_mismatch");
  const facts: Partial<Record<EvidenceField, string>> = {};
  add(facts, "episodes", m.episodes);
  add(facts, "studio", set((m.studios ?? []).map((s: any) => s.name)));
  add(facts, "producers", set((m.producers ?? []).map((s: any) => s.name)));
  add(facts, "genres", set((m.genres ?? []).map((s: any) => s.name)));
  add(
    facts,
    "format",
    (
      {
        TV: "TV",
        Movie: "MOVIE",
        OVA: "OVA",
        ONA: "ONA",
        Special: "SPECIAL",
        Music: "MUSIC",
        "TV Special": "SPECIAL",
      } as Record<string, string>
    )[m.type],
  );
  add(
    facts,
    "source",
    typeof m.source === "string"
      ? m.source.toUpperCase().replace(/ /g, "_")
      : null,
  );
  add(
    facts,
    "status",
    (
      {
        "Finished Airing": "FINISHED",
        "Currently Airing": "RELEASING",
        "Not yet aired": "NOT_YET_RELEASED",
      } as Record<string, string>
    )[m.status],
  );
  const d = (v: unknown) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)
      ? v.slice(0, 10)
      : null;
  add(facts, "start_date", d(m.aired?.from));
  add(facts, "end_date", d(m.aired?.to));
  if (d(m.aired?.from)) add(facts, "year", Number(m.aired.from.slice(0, 4)));
  add(
    facts,
    "season",
    typeof m.season === "string" ? m.season.toUpperCase() : null,
  );
  const duration =
    typeof m.duration === "string"
      ? /^(?:(\d+) hr\.?\s*)?(?:(\d+) min\.?)/.exec(m.duration)
      : null;
  if (duration)
    add(facts, "duration", Number(duration[1] ?? 0) * 60 + Number(duration[2]));
  return facts;
}
export function malLinks(
  body: any,
  kind: "news" | "discussion",
): RelatedLink[] {
  return (Array.isArray(body?.data) ? body.data : [])
    .slice(0, 6)
    .flatMap((m: any) => {
      const url = safeUrl(m.url, ["myanimelist.net", "www.myanimelist.net"]);
      if (!url || typeof m.title !== "string") return [];
      return [
        {
          kind,
          title: m.title.replace(/<[^>]*>/g, "").slice(0, 240),
          url,
          source: kind === "news" ? "MyAnimeList news" : "MyAnimeList forum",
          publishedAt:
            typeof m.date === "string" && Number.isFinite(Date.parse(m.date))
              ? new Date(m.date).toISOString()
              : null,
          score:
            Number.isSafeInteger(m.comments) && m.comments >= 0
              ? m.comments
              : null,
          scoreKind: Number.isSafeInteger(m.comments)
            ? ("replies" as const)
            : null,
          label: "Discussion, not verified",
        },
      ];
    });
}
export function wikiQuery(id: number) {
  return (
    'SELECT ?item ?episodes ?start ?startPrecision ?end ?endPrecision ?networkLabel ?article WHERE {?item wdt:P4086 "' +
    id +
    '" . FILTER NOT EXISTS{?item wdt:P4086 ?other FILTER(?other != "' +
    id +
    '") } OPTIONAL{?item wdt:P1113 ?episodes} OPTIONAL{?item p:P580/psv:P580 ?sn . ?sn wikibase:timeValue ?start;wikibase:timePrecision ?startPrecision} OPTIONAL{?item p:P582/psv:P582 ?en . ?en wikibase:timeValue ?end;wikibase:timePrecision ?endPrecision} OPTIONAL{?item wdt:P449 ?network} OPTIONAL{?article schema:about ?item;schema:isPartOf <https://en.wikipedia.org/>} OPTIONAL{?network rdfs:label ?networkLabel FILTER(LANG(?networkLabel)="en")}} LIMIT 30'
  );
}
export function wikiFacts(body: any): {
  url: string;
  facts: Partial<Record<EvidenceField, string>>;
  links: RelatedLink[];
} {
  const rows = body?.results?.bindings;
  if (!Array.isArray(rows) || rows.length === 0 || rows.length >= 30)
    throw new Error("unmapped");
  const values = (key: string) => [
    ...new Set(
      rows
        .map((r: any) => r[key]?.value)
        .filter((s: unknown): s is string => typeof s === "string"),
    ),
  ];
  const entities = values("item");
  if (
    entities.length !== 1 ||
    !/^https?:\/\/www.wikidata.org\/entity\/Q\d+$/.test(entities[0])
  )
    throw new Error("ambiguous_entity");
  const url = entities[0].replace("http:", "https:"),
    facts: Partial<Record<EvidenceField, string>> = {};
  const episodes = values("episodes");
  if (episodes.length === 1 && /^\d+$/.test(episodes[0]))
    add(facts, "episodes", Number(episodes[0]));
  for (const [column, field] of [
    ["start", "start_date"],
    ["end", "end_date"],
  ] as const) {
    const dates = values(column);
    if (dates.length === 1 && /^\d{4}-\d{2}-\d{2}T/.test(dates[0])) {
      const precise = rows
        .filter((r: any) => r[column]?.value === dates[0])
        .every((r: any) => Number(r[column + "Precision"]?.value) >= 11);
      if (precise) add(facts, field, dates[0].slice(0, 10));
      if (
        column === "start" &&
        rows.every((r: any) => Number(r.startPrecision?.value) >= 9)
      )
        add(facts, "year", Number(dates[0].slice(0, 4)));
    }
  }
  const networks = values("networkLabel").filter((n) => !/^Q\d+$/.test(n));
  if (networks.length) add(facts, "network", set(networks));
  const links: RelatedLink[] = values("article").flatMap((u) => {
    const clean = safeUrl(u, ["en.wikipedia.org"]);
    return clean
      ? [
          {
            kind: "reference" as const,
            title: "Encyclopedia entry for this mapped adaptation",
            url: clean,
            source: "Wikipedia",
            publishedAt: null,
            score: null,
            scoreKind: null,
            label: "Reference link, not a second vote",
          },
        ]
      : [];
  });
  return { url, facts, links };
}
export function searchLinks(record: AnimeRecord): RelatedLink[] {
  const q = encodeURIComponent('"' + record.title + '"');
  const link = (title: string, url: string, source: string): RelatedLink => ({
    kind: "search",
    title,
    url,
    source,
    publishedAt: null,
    score: null,
    scoreKind: null,
    label: "Search link, not verified",
  });
  return [
    link(
      "r/anime conversations",
      "https://www.reddit.com/r/anime/search/?q=" + q + "&restrict_sr=1",
      "Reddit",
    ),
    link(
      "Episode discussion search",
      "https://www.reddit.com/r/anime/search/?q=" +
        encodeURIComponent(record.title + " episode discussion") +
        "&restrict_sr=1&sort=new",
      "Reddit",
    ),
    link(
      "Encyclopedia search",
      "https://en.wikipedia.org/w/index.php?search=" +
        encodeURIComponent(record.title + " anime"),
      "Wikipedia",
    ),
    ...(record.idMal
      ? [
          link(
            "MyAnimeList title and discussions",
            "https://myanimelist.net/anime/" + record.idMal,
            "MyAnimeList",
          ),
        ]
      : []),
  ];
}
export async function collectSources(
  record: AnimeRecord,
  kind: QuestionKind,
  env: Env,
  store: Store,
  fetcher: Fetcher,
  deadline: Deadline,
): Promise<SourcePayload[]> {
  const id = record.idMal;
  if (!Number.isSafeInteger(id) || !id || id < 1)
    return [
      blank(
        "mal",
        "MyAnimeList via Jikan",
        "https://myanimelist.net/",
        "not-matched",
        "AniList has no exact MyAnimeList identifier; title guessing is disabled.",
      ),
      blank(
        "wikidata",
        "Wikidata",
        "https://www.wikidata.org/",
        "not-matched",
        "An exact identifier is required before comparing this adaptation.",
      ),
    ];
  const malUrl = "https://myanimelist.net/anime/" + id;
  const mal = async () => {
    const part =
        kind === "news" ? "news" : kind === "discussion" ? "forum" : "full",
      url = "https://api.jikan.moe/v4/anime/" + id + "/" + part;
    return cachedSource(
      "v1:mal:" + id + ":" + part,
      "mal",
      "MyAnimeList via Jikan",
      malUrl,
      part === "full" ? 86400000 : 3600000,
      env,
      store,
      deadline,
      async (signal) => {
        const body = await json(url, fetcher, store, "mal", signal);
        return {
          source: {
            id: "mal",
            label: "MyAnimeList via Jikan",
            state: "available",
            url: malUrl,
            cached: false,
            fetchedAt: iso(),
            note: "Unofficial read-only access; the catalogs may share upstream information.",
          },
          facts: part === "full" ? malFacts(body.data, id!) : {},
          links:
            part === "full"
              ? []
              : malLinks(body, part === "news" ? "news" : "discussion"),
        };
      },
    );
  };
  const wiki = async () =>
    cachedSource(
      "v1:wikidata:" + id,
      "wikidata",
      "Wikidata",
      "https://www.wikidata.org/",
      86400000,
      env,
      store,
      deadline,
      async (signal) => {
        const url =
          "https://query.wikidata.org/sparql?query=" +
          encodeURIComponent(wikiQuery(id!)) +
          "&format=json";
        const data = wikiFacts(
          await json(url, fetcher, store, "wikidata", signal),
        );
        return {
          source: {
            id: "wikidata",
            label: "Wikidata",
            state: "available",
            url: data.url,
            cached: false,
            fetchedAt: iso(),
            note: "Exactly one adaptation and one MyAnimeList identifier; uncertain fields are omitted.",
          },
          facts: data.facts,
          links: data.links,
        };
      },
    );
  const tasks =
    kind === "news" || kind === "discussion" ? [mal()] : [mal(), wiki()];
  const result = await Promise.allSettled(tasks);
  return result.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : blank(
          i ? "wikidata" : "mal",
          i ? "Wikidata" : "MyAnimeList via Jikan",
          i ? "https://www.wikidata.org/" : malUrl,
          "unavailable",
          "Unavailable now: request deadline reached.",
        ),
  );
}
