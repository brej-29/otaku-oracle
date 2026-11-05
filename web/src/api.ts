// All network access lives here. UI never talks to a provider directly.
const ANILIST = "https://graphql.anilist.co";

export type Hit = { id: number; title: string; year: number | null; format: string | null; cover: string | null; color: string | null };
export type MediaRecord = {
  id: number; title: string; native: string | null; format: string | null; episodes: number | null; status: string | null;
  season: string | null; seasonYear: number | null; source: string | null; year: number | null;
  cover: string | null; color: string | null; studios: string[]; url: string; genres: string[];
};
export type Fact = { key: string; label: string; value: string; sentence: string; url: string };
export type Answer = {
  title: string; record: MediaRecord; facts: Fact[];
  explanation: string; // unverified prose
  demo: true; // flips to false once a real backend answers
  fetchedAt: string;
};
export class ApiError extends Error {
  kind: "rate" | "offline" | "upstream" | "empty";
  constructor(kind: "rate" | "offline" | "upstream" | "empty", message: string) { super(message); this.kind = kind; }
}

const cache = new Map<string, unknown>();

async function gql<T>(query: string, variables: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const k = JSON.stringify([query, variables]);
  if (cache.has(k)) return cache.get(k) as T;
  let res: Response;
  try {
    res = await fetch(ANILIST, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ query, variables }), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError("offline", "Can't reach AniList. Check your connection and try again.");
  }
  if (res.status === 429) throw new ApiError("rate", "AniList is rate limiting us (30 requests a minute). Wait a moment, then try again.");
  if (!res.ok) throw new ApiError("upstream", `AniList answered ${res.status}. Try again shortly.`);
  const json = await res.json();
  cache.set(k, json.data);
  return json.data as T;
}

const nice = (s: string | null) => (s ? s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : null);
const fmt = (s: string | null) => (s && s.length <= 3 ? s : nice(s));

export async function searchTitles(q: string, signal?: AbortSignal): Promise<Hit[]> {
  const d = await gql<{ Page: { media: any[] } }>(
    `query($s:String){Page(perPage:6){media(search:$s,type:ANIME,isAdult:false,sort:SEARCH_MATCH){id title{romaji english} startDate{year} format coverImage{medium color}}}}`,
    { s: q }, signal);
  return d.Page.media.map((m) => ({ id: m.id, title: m.title.english || m.title.romaji, year: m.startDate?.year ?? null, format: fmt(m.format), cover: m.coverImage?.medium ?? null, color: m.coverImage?.color ?? null }));
}

export async function getRecord(id: number, signal?: AbortSignal): Promise<MediaRecord> {
  const d = await gql<{ Media: any }>(
    `query($id:Int){Media(id:$id,type:ANIME){id title{romaji english native} format episodes status season seasonYear source startDate{year} coverImage{extraLarge color} studios(isMain:true){nodes{name}} siteUrl genres}}`,
    { id }, signal);
  const m = d.Media;
  if (!m) throw new ApiError("empty", "AniList has no record for that title.");
  return {
    id: m.id, title: m.title.english || m.title.romaji, native: m.title.native, format: fmt(m.format), episodes: m.episodes, status: nice(m.status),
    season: nice(m.season), seasonYear: m.seasonYear, source: nice(m.source), year: m.startDate?.year ?? null, cover: m.coverImage?.extraLarge ?? null,
    color: m.coverImage?.color ?? null, studios: (m.studios?.nodes ?? []).map((s: any) => s.name), url: m.siteUrl, genres: m.genres ?? [],
  };
}

const INTENTS: [RegExp, string][] = [
  [/studio|animat|produc|made by|who made/i, "studio"], [/episode|how long|how many ep/i, "episodes"],
  [/year|when|air|releas|premier|start/i, "year"], [/format|movie|film|ova|tv\b|series/i, "format"],
  [/source|based|adapt|manga|novel|original/i, "source"], [/season/i, "season"],
];

function factsFor(r: MediaRecord): Record<string, Fact | null> {
  const f = (key: string, label: string, value: string | null, sentence: string): Fact | null => (value ? { key, label, value, sentence, url: r.url } : null);
  return {
    studio: r.studios.length ? f("studio", "Studio", r.studios.join(", "), `${r.title} was animated by ${r.studios.join(" and ")}.`) : null,
    episodes: r.episodes ? f("episodes", "Episodes", String(r.episodes), `${r.title} has ${r.episodes} episodes.`) : null,
    year: r.year ? f("year", "Started", String(r.year), `${r.title} started airing in ${r.year}.`) : null,
    format: f("format", "Format", r.format, `${r.title} is a ${r.format} release.`),
    source: f("source", "Source", r.source, `${r.title} is adapted from a ${r.source?.toLowerCase()} source.`),
    season: r.season && r.seasonYear ? f("season", "Season", `${r.season} ${r.seasonYear}`, `${r.title} aired in ${r.season} ${r.seasonYear}.`) : null,
  };
}

/** DEMO: verified facts come from the real AniList record; the explanation is a fixed placeholder, never a model output. */
export async function ask(id: number, question: string, signal?: AbortSignal): Promise<Answer> {
  const record = await getRecord(id, signal);
  const all = factsFor(record);
  const wanted = INTENTS.filter(([re]) => re.test(question)).map(([, k]) => k);
  const keys = wanted.length ? wanted : ["studio", "episodes", "year"];
  const facts = keys.map((k) => all[k]).filter((x): x is Fact => !!x);
  if (!facts.length) throw new ApiError("empty", "The AniList record has no fact that answers that. Try asking about the studio, episodes or year.");
  return {
    title: record.title, record, facts, demo: true, fetchedAt: new Date().toISOString(),
    explanation: "A model would add context here, such as tone or themes. Nothing in the record confirms it, so it stays in pencil.",
  };
}

export type EvalArm = { accuracy: number | null; lo: number | null; hi: number | null; responses: number; expected: number };
export type EvalModel = { id: string; label: string; provider: string; primary: boolean; arms: { A: EvalArm; B: EvalArm } };
export type EvalSummary = { status: "PENDING" | "RUNNING" | "PARTIAL" | "COMPLETE"; updated_at: string | null; note: string; sample?: boolean; models: EvalModel[] };

export async function getEval(sample: boolean): Promise<EvalSummary> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${sample ? "eval-sample.json" : "eval-summary.json"}`, { cache: "no-cache" });
  if (!res.ok) throw new ApiError("upstream", "The evaluation summary didn't load.");
  return res.json();
}
