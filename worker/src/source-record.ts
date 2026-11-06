import type { AnimeRecord } from "./types";
import type { EvidenceField } from "./source-types";
const strings = (xs: unknown[]) =>
  JSON.stringify(
    [
      ...new Set(
        xs
          .filter((s): s is string => typeof s === "string" && s.length > 0)
          .map((s) => s.slice(0, 300)),
      ),
    ].slice(0, 30),
  );
export function date(v: any): string | null {
  if (!v || ![v.year, v.month, v.day].every(Number.isSafeInteger)) return null;
  const s =
    String(v.year).padStart(4, "0") +
    "-" +
    String(v.month).padStart(2, "0") +
    "-" +
    String(v.day).padStart(2, "0");
  const d = new Date(s + "T00:00:00Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s ? s : null;
}
export function detailsFromMedia(
  m: any,
): Partial<Record<EvidenceField, string>> {
  const out: Partial<Record<EvidenceField, string>> = {};
  const set = (f: EvidenceField, v: unknown) => {
    if (typeof v === "string" && v && v !== "[]") out[f] = v.slice(0, 6000);
    else if (Number.isSafeInteger(v) && Number(v) >= 0) out[f] = String(v);
  };
  set("status", m.status);
  set("duration", m.duration);
  set("start_date", date(m.startDate));
  set("end_date", date(m.endDate));
  set("popularity", m.popularity);
  set("trending", m.trending);
  set("genres", strings(m.genres ?? []));
  set(
    "producers",
    strings(
      (m.producers?.nodes ?? [])
        .filter((n: any) => n.isAnimationStudio === false)
        .map((n: any) => n.name),
    ),
  );
  set(
    "voice_cast",
    strings(
      (m.characters?.edges ?? []).flatMap((e: any) =>
        (e.voiceActors ?? []).map((a: any) => a.name?.full),
      ),
    ),
  );
  set("main_characters", m.characters?.pageInfo?.total);
  set(
    "relations",
    strings(
      (m.relations?.edges ?? []).map(
        (e: any) =>
          (e.relationType ?? "RELATED") +
          ": " +
          (e.node?.title?.english || e.node?.title?.romaji || "Unlisted"),
      ),
    ),
  );
  if (
    Number.isSafeInteger(m.nextAiringEpisode?.airingAt) &&
    Number.isSafeInteger(m.nextAiringEpisode?.episode)
  )
    set(
      "next_episode",
      "Episode " +
        m.nextAiringEpisode.episode +
        " at " +
        new Date(m.nextAiringEpisode.airingAt * 1000).toISOString(),
    );
  set(
    "streaming",
    strings(
      (m.externalLinks ?? [])
        .filter((e: any) => e.type === "STREAMING")
        .map((e: any) => e.site),
    ),
  );
  set(
    "external_links",
    strings((m.externalLinks ?? []).map((e: any) => e.site)),
  );
  return out;
}
export function aniFacts(
  r: AnimeRecord,
): Partial<Record<EvidenceField, string>> {
  return {
    ...r.details,
    ...Object.fromEntries(
      Object.entries({
        studio: r.studios.length ? JSON.stringify(r.studios) : null,
        episodes: r.episodes,
        year: r.year,
        format: r.format,
        source: r.source,
        season: r.season,
      })
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ),
  };
}
