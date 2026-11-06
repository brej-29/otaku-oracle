// All network access lives here. UI never talks to a provider directly.
const ANILIST = "https://graphql.anilist.co";

export type Hit = {
  id: number;
  title: string;
  year: number | null;
  format: string | null;
  cover: string | null;
  color: string | null;
};
export type MediaRecord = {
  id: number;
  title: string;
  native: string | null;
  format: string | null;
  episodes: number | null;
  status: string | null;
  mainCharacters?: number | null;
  season: string | null;
  seasonYear: number | null;
  source: string | null;
  year: number | null;
  cover: string | null;
  color: string | null;
  studios: string[];
  url: string;
  genres: string[];
};
export type ClaimStatus = "verified" | "conflict" | "unchecked";
export type Claim = {
  id: string;
  text: string;
  field: string | null;
  value: string | null;
  status: ClaimStatus;
  recordValue: string | null;
  sourceUrl: string;
};
export type Answer = {
  title: string;
  record: MediaRecord;
  claims: Claim[];
  explanation: string | null; // unverified prose
  mode: "model" | "record-only";
  model: { id: string; provider: string } | null;
  demo: boolean; // true while no backend answered
  notice: string | null;
  fetchedAt: string;
};
export class ApiError extends Error {
  kind: "rate" | "offline" | "upstream" | "empty";
  constructor(
    kind: "rate" | "offline" | "upstream" | "empty",
    message: string,
  ) {
    super(message);
    this.kind = kind;
  }
}

const cache = new Map<string, unknown>();

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const k = JSON.stringify([query, variables]);
  if (cache.has(k)) return cache.get(k) as T;
  let res: Response;
  const transportSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(10000)])
    : AbortSignal.timeout(10000);
  try {
    res = await fetch(ANILIST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      signal: transportSignal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (transportSignal.aborted)
      throw new ApiError(
        "upstream",
        "The source did not arrive in time. Please try again.",
      );
    throw new ApiError(
      "offline",
      "Can't reach AniList. Check your connection and try again.",
    );
  }
  if (res.status === 429)
    throw new ApiError(
      "rate",
      "AniList is rate limiting us (30 requests a minute). Wait a moment, then try again.",
    );
  if (!res.ok)
    throw new ApiError(
      "upstream",
      `AniList answered ${res.status}. Try again shortly.`,
    );
  const json = await res.json();
  if (json.errors || !json.data)
    throw new ApiError(
      "upstream",
      "AniList could not read that request. Please try again shortly.",
    );
  cache.set(k, json.data);
  return json.data as T;
}

const nice = (s: string | null) =>
  s
    ? s
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^./, (c) => c.toUpperCase())
    : null;
const fmt = (s: string | null) => (s && s.length <= 3 ? s : nice(s));

export async function searchTitles(
  q: string,
  signal?: AbortSignal,
): Promise<Hit[]> {
  const d = await gql<{ Page: { media: any[] } }>(
    `query($s:String){Page(perPage:6){media(search:$s,type:ANIME,isAdult:false,sort:SEARCH_MATCH){id title{romaji english} startDate{year} format coverImage{medium color}}}}`,
    { s: q },
    signal,
  );
  return d.Page.media.map((m) => ({
    id: m.id,
    title: m.title.english || m.title.romaji,
    year: m.startDate?.year ?? null,
    format: fmt(m.format),
    cover: m.coverImage?.medium ?? null,
    color: m.coverImage?.color ?? null,
  }));
}

export async function getRecord(
  id: number,
  signal?: AbortSignal,
): Promise<MediaRecord> {
  const d = await gql<{ Media: any }>(
    `query($id:Int){Media(id:$id,type:ANIME){id title{romaji english native} format episodes status season seasonYear source startDate{year} coverImage{extraLarge color} studios(isMain:true){nodes{name}} siteUrl genres characters(role:MAIN){pageInfo{total}}}}`,
    { id },
    signal,
  );
  const m = d.Media;
  if (!m) throw new ApiError("empty", "AniList has no record for that title.");
  return {
    mainCharacters: m.characters?.pageInfo?.total ?? null,
    id: m.id,
    title: m.title.english || m.title.romaji,
    native: m.title.native,
    format: fmt(m.format),
    episodes: m.episodes,
    status: nice(m.status),
    season: nice(m.season),
    seasonYear: m.seasonYear,
    source: nice(m.source),
    year: m.startDate?.year ?? null,
    cover: m.coverImage?.extraLarge ?? null,
    color: m.coverImage?.color ?? null,
    studios: (m.studios?.nodes ?? []).map((s: any) => s.name),
    url: m.siteUrl,
    genres: m.genres ?? [],
  };
}

const INTENTS: [RegExp, string][] = [
  [/studio|animat|produc|made by|who made/i, "studio"],
  [/episode|how long|how many ep/i, "episodes"],
  [/year|when|air|releas|premier|start/i, "year"],
  [/format|movie|film|ova|tv\b|series/i, "format"],
  [/main charact|character count|how many charact/i, "main_characters"],
  [/source|based|adapt|manga|novel|original/i, "source"],
  [/season/i, "season"],
];

function recordClaims(r: MediaRecord): Record<string, Claim | null> {
  const c = (
    field: string,
    value: string | null,
    text: string,
  ): Claim | null =>
    value
      ? {
          id: field,
          text,
          field,
          value,
          status: "verified",
          recordValue: value,
          sourceUrl: r.url,
        }
      : null;
  return {
    main_characters:
      r.mainCharacters != null
        ? c(
            "main_characters",
            String(r.mainCharacters),
            `${r.title} has ${r.mainCharacters} main characters listed.`,
          )
        : null,
    studio: r.studios.length
      ? c(
          "studio",
          r.studios.join(", "),
          `${r.title} was animated by ${r.studios.join(" and ")}.`,
        )
      : null,
    episodes: r.episodes
      ? c(
          "episodes",
          String(r.episodes),
          `${r.title} has ${r.episodes} episodes.`,
        )
      : null,
    year: r.year
      ? c("year", String(r.year), `${r.title} started airing in ${r.year}.`)
      : null,
    format: c("format", r.format, `${r.title} is a ${r.format} release.`),
    source: c(
      "source",
      r.source,
      `${r.title} is adapted from a ${r.source?.toLowerCase()} source.`,
    ),
    season:
      r.season && r.seasonYear
        ? c(
            "season",
            `${r.season} ${r.seasonYear}`,
            `${r.title} aired in ${r.season} ${r.seasonYear}.`,
          )
        : null,
  };
}

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

async function askBackend(
  id: number,
  question: string,
  signal?: AbortSignal,
): Promise<Answer> {
  let res: Response;
  const transportSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
    : AbortSignal.timeout(20000);
  try {
    res = await fetch(`${API_BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleId: id, question }),
      signal: transportSignal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (transportSignal.aborted)
      throw new ApiError(
        "upstream",
        "The answer did not arrive in time. Your question is still here; please try again.",
      );
    throw new ApiError(
      "offline",
      "Can't reach the server. Check your connection and try again.",
    );
  }
  if (res.status === 429)
    throw new ApiError(
      "rate",
      "Too many questions for now. Wait a minute, then try again.",
    );
  if (res.status === 404)
    throw new ApiError("empty", "That title isn't on AniList.");
  if (!res.ok)
    throw new ApiError(
      "upstream",
      "The answer service had a problem. Nothing was stamped. Try again shortly.",
    );
  let j;
  try {
    j = await res.json();
  } catch {
    throw new ApiError(
      "upstream",
      "The answer could not be read. Please try again.",
    );
  }
  if (
    !j?.record ||
    !Array.isArray(j.claims) ||
    j.claims.some(
      (c: Claim) => !["verified", "conflict", "unchecked"].includes(c.status),
    )
  )
    throw new ApiError(
      "upstream",
      "The answer could not be checked. Please try again.",
    );
  return {
    title: j.title,
    record: {
      ...j.record,
      status: null,
      studios: j.record.studios ?? [],
      genres: j.record.genres ?? [],
    },
    claims: j.claims,
    explanation: j.explanation,
    mode: j.mode,
    model: j.model,
    demo: false,
    notice: j.notice,
    fetchedAt: j.fetchedAt,
  };
}

/** Without VITE_API_BASE this is DEMO: claims come straight from the real AniList record, no model involved.
 *  `?states` adds two clearly labelled design-review claims so the conflict and unchecked looks can be reviewed. */
async function askDemo(
  id: number,
  question: string,
  signal?: AbortSignal,
): Promise<Answer> {
  const record = await getRecord(id, signal);
  const all = recordClaims(record);
  const wanted = INTENTS.filter(([re]) => re.test(question)).map(([, k]) => k);
  const keys = wanted;
  const claims = keys.map((k) => all[k]).filter((x): x is Claim => !!x);
  if (!claims.length)
    throw new ApiError(
      "empty",
      "This record-only demo cannot answer that question. You can check the studio, episodes, start year, format, source, season or main character count.",
    );
  const states =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).has("states");
  if (states) {
    claims.push({
      id: "demo-conflict",
      field: "episodes",
      value: "99",
      status: "conflict",
      recordValue: record.episodes ? String(record.episodes) : "unknown",
      text: `Design-review claim: ${record.title} has 99 episodes.`,
      sourceUrl: record.url,
    });
    claims.push({
      id: "demo-unchecked",
      field: null,
      value: null,
      status: "unchecked",
      recordValue: null,
      text: "Design-review claim: fans often call it a classic.",
      sourceUrl: record.url,
    });
  }
  return {
    title: record.title,
    record,
    claims,
    mode: "record-only",
    model: null,
    demo: true,
    fetchedAt: new Date().toISOString(),
    explanation: states
      ? "Design-review explanation. A model would add context here. Nothing in the record confirms it."
      : null,
    notice: "Demo mode: facts are live from AniList, no model is attached yet.",
  };
}

export const ask = (id: number, question: string, signal?: AbortSignal) =>
  API_BASE ? askBackend(id, question, signal) : askDemo(id, question, signal);

export async function popular(signal?: AbortSignal): Promise<Hit[]> {
  const d = await gql<{ Page: { media: any[] } }>(
    `query{Page(perPage:8){media(type:ANIME,isAdult:false,sort:POPULARITY_DESC){id title{romaji english} startDate{year} format coverImage{large color}}}}`,
    {},
    signal,
  );
  return d.Page.media.map((m) => ({
    id: m.id,
    title: m.title.english || m.title.romaji,
    year: m.startDate?.year ?? null,
    format: fmt(m.format),
    cover: m.coverImage?.large ?? null,
    color: m.coverImage?.color ?? null,
  }));
}

export type EvalArm = {
  accuracy: number | null;
  lo: number | null;
  hi: number | null;
  responses: number;
  expected: number;
};
export type EvalModel = {
  id: string;
  label: string;
  provider: string;
  primary: boolean;
  arms: { A: EvalArm; B: EvalArm };
};
export type EvalSummary = {
  status: "PENDING" | "RUNNING" | "PARTIAL" | "COMPLETE";
  updated_at: string | null;
  note: string;
  sample?: boolean;
  models: EvalModel[];
};

export async function getEval(sample: boolean): Promise<EvalSummary> {
  const res = await fetch(
    `${import.meta.env.BASE_URL}data/${sample ? "eval-sample.json" : "eval-summary.json"}`,
    { cache: "no-cache" },
  );
  if (!res.ok)
    throw new ApiError("upstream", "The evaluation summary didn't load.");
  return res.json();
}
