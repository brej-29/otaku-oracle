import { normalize, integer } from "./checker";
import { aniFacts } from "./source-record";
import { searchLinks } from "./sources";
import type { Answer, Claim } from "./types";
import type {
  EvidenceField,
  SourcePayload,
  Verification,
  QuestionKind,
} from "./source-types";
const numeric = new Set<EvidenceField>([
  "episodes",
  "year",
  "duration",
  "main_characters",
  "popularity",
  "trending",
]);
const sets = new Set<EvidenceField>([
  "studio",
  "genres",
  "producers",
  "voice_cast",
  "network",
  "relations",
  "streaming",
  "external_links",
]);
// These values describe AniList's own catalog graph, metrics or schedule only.
const authoritative = new Set<EvidenceField>([
  "relations",
  "next_episode",
  "popularity",
  "trending",
  "streaming",
  "external_links",
]);
const labels: Record<EvidenceField, string> = {
  studio: "Animation studios",
  episodes: "Episode count",
  year: "Start year",
  format: "Format",
  source: "Source material",
  season: "Season",
  status: "Airing status",
  duration: "Minutes per episode",
  start_date: "Start date",
  end_date: "End date",
  genres: "Listed genres",
  producers: "Listed producers",
  voice_cast: "Japanese main voice cast",
  relations: "AniList related-title graph",
  next_episode: "AniList next scheduled episode",
  popularity: "AniList popularity count",
  trending: "AniList trending activity",
  streaming: "AniList streaming listings",
  external_links: "AniList external destinations",
  main_characters: "Main character count",
  network: "Original network",
};
export function equalEvidence(
  field: EvidenceField,
  a: string,
  b: string,
): boolean {
  if (numeric.has(field)) {
    const n = integer(a);
    return n !== null && n === integer(b);
  }
  if (sets.has(field)) {
    try {
      const x = JSON.parse(a),
        y = JSON.parse(b);
      if (
        !Array.isArray(x) ||
        !Array.isArray(y) ||
        !x.every((v) => typeof v === "string") ||
        !y.every((v) => typeof v === "string")
      )
        return false;
      const left = new Set(x.map(normalize)),
        right = new Set(y.map(normalize));
      return left.size === right.size && [...left].every((v) => right.has(v));
    } catch {
      return false;
    }
  }
  return normalize(a) === normalize(b);
}
export function verify(
  claim: Claim,
  field: EvidenceField,
  sources: SourcePayload[],
): Claim {
  const evidence = sources.flatMap((s) => {
    const value = s.facts[field];
    return value && s.source.fetchedAt
      ? [
          {
            sourceId: s.source.id,
            source: s.source.label,
            value,
            url: s.source.url,
            fetchedAt: s.source.fetchedAt,
            stale: s.source.state === "stale",
          },
        ]
      : [];
  });
  const disagree =
    evidence.length > 1 &&
    evidence.some((e) => !equalEvidence(field, e.value, evidence[0].value));
  const contradict =
    claim.value !== null &&
    evidence.some((e) => !equalEvidence(field, claim.value!, e.value));
  const fresh = evidence.filter((e) => !e.stale),
    two = new Set(fresh.map((e) => e.sourceId)).size >= 2;
  const single =
    authoritative.has(field) && fresh.some((e) => e.sourceId === "anilist");
  let status: Claim["status"] = "unchecked",
    basis: Verification["basis"] = "insufficient",
    note = "Not enough independent evidence to verify this claim.";
  if (disagree) {
    status = "conflict";
    basis = "sources-disagree";
    note =
      "The sources list different values. This can reflect an edition, date or naming difference; no source is silently preferred.";
  } else if (contradict) {
    status = "conflict";
    basis = "claim-disagrees";
    note = "The drafted value contradicts the available source value.";
  } else if (claim.value !== null && (two || single)) {
    status = "verified";
    basis = two ? "agreement" : "single-source";
    note = two
      ? "At least two catalogs agree; none of the retrieved sources disagree. Shared provenance is still possible."
      : "Single-source: this is AniList's own graph, metric, link listing or schedule, not independent corroboration.";
  } else if (evidence.some((e) => e.stale)) {
    basis = "stale";
    note =
      "Only stale or insufficient evidence is available; this remains unchecked.";
  }
  return { ...claim, status, verification: { field, basis, evidence, note } };
}
function plain(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : value;
  } catch {
    return value;
  }
}
export function extendAnswer(
  base: Answer,
  kind: QuestionKind,
  fields: EvidenceField[],
  additional: SourcePayload[],
): Answer {
  const anilist: SourcePayload = {
    source: {
      id: "anilist",
      label: "AniList",
      state:
        Date.now() - Date.parse(base.fetchedAt) > 86400000
          ? "stale"
          : "available",
      url: base.record.url,
      fetchedAt: base.fetchedAt,
      cached: base.recordCached,
      note: "Reference, not the truth.",
    },
    facts: aniFacts(base.record),
    links: [],
  };
  const expected = [
    {
      id: "mal",
      label: "MyAnimeList via Jikan",
      url: "https://myanimelist.net/",
    },
    { id: "wikidata", label: "Wikidata", url: "https://www.wikidata.org/" },
  ];
  const missing = expected
    .filter((e) => !additional.some((s) => s.source.id === e.id))
    .map((e) => ({
      source: {
        ...e,
        state: "unavailable" as const,
        fetchedAt: null,
        cached: false,
        note: "Unavailable now: source lookup did not finish within the deadline.",
      },
      facts: {},
      links: [],
    }));
  const sources: SourcePayload[] = [
    anilist,
    ...additional,
    ...(kind === "fact" || kind === "unclear" ? missing : []),
  ];
  const claims: Claim[] =
    kind === "fact"
      ? base.claims
          .filter((c) => c.field !== null && fields.includes(c.field))
          .map((c) => verify(c, c.field!, sources))
      : [];
  if (kind === "fact")
    for (const field of fields) {
      if (claims.some((c) => (c.verification?.field ?? c.field) === field))
        continue;
      const source = sources.find((s) => s.facts[field] !== undefined);
      if (!source) continue;
      const value = source.facts[field]!;
      const legacy = [
        "studio",
        "episodes",
        "year",
        "format",
        "source",
        "season",
      ].includes(field);
      claims.push(
        verify(
          {
            id: "source-" + field,
            text: labels[field] + ": " + plain(value) + ".",
            field: legacy ? (field as Claim["field"]) : null,
            value,
            status: "unchecked",
            recordValue: anilist.facts[field] ?? null,
            sourceUrl: source.source.url,
          },
          field,
          sources,
        ),
      );
    }
  const related = [
    ...sources.flatMap((s) => s.links),
    ...searchLinks(base.record),
    ...(base.record.resourceLinks ?? []).slice(0, 8).map((l) => ({
      kind: "reference" as const,
      title:
        (l.kind === "streaming" ? "Watch on " : "Official / external: ") +
        l.site,
      url: l.url,
      source: "AniList external listing",
      publishedAt: null,
      score: null,
      scoreKind: null,
      label: "External link, availability varies by region",
    })),
  ]
    .filter((l, i, a) => a.findIndex((x) => x.url === l.url) === i)
    .slice(0, 16);
  const status =
    kind !== "fact"
      ? "discussion"
      : claims.some((c) => c.status === "conflict")
        ? "conflict"
        : claims.length > 0 && claims.every((c) => c.status === "verified")
          ? "verified"
          : "unchecked";
  const summary =
    kind === "news"
      ? "Announcements and rumours need primary reporting. These links are leads, not verified facts."
      : kind === "discussion"
        ? "What people are saying: discussion and opinion cannot receive a factual verification stamp."
        : kind === "unclear"
          ? "We could not map this question to a checkable fact. Explore these matching reference and discussion links."
          : status === "conflict"
            ? "The retrieved evidence has a disagreement. Compare each source below."
            : status === "verified"
              ? "The requested values agree across sources, or are explicitly identified as AniList-only catalog data."
              : "Some values could not be corroborated. Unavailable and stale sources are shown explicitly.";
  return {
    ...base,
    claims,
    explanation: kind === "fact" ? base.explanation : null,
    questionKind: kind,
    resolution: { status, summary },
    sources: [
      ...sources.map((s) => s.source),
      {
        id: "reddit",
        label: "Reddit",
        state: "link-only",
        url: "https://www.reddit.com/r/anime/",
        fetchedAt: null,
        cached: false,
        note: "Search links only. No Reddit data is fetched; official access requires prior approval.",
      },
    ],
    related,
    notice: kind === "fact" ? base.notice : summary,
  };
}
