import { detailsFromMedia } from "./source-record";
import type { Deadline } from "./deadline";
import { ApiError, type AnimeRecord, type Fetcher } from "./types";
import { Store, type StoredRecord } from "./storage";
import { readLimited } from "./parse";
import { retryAt } from "./providers";
const QUERY =
  "query($id:Int!){Media(id:$id,type:ANIME){id idMal title{romaji english native} format episodes duration status startDate{year month day} endDate{year month day} season seasonYear source coverImage{large color} genres studios(isMain:true){nodes{name}} producers:studios(isMain:false){nodes{name isAnimationStudio}} popularity trending nextAiringEpisode{episode airingAt} relations{edges{relationType node{id title{romaji english} siteUrl}}} characters(role:MAIN,perPage:12){pageInfo{total} edges{node{name{full}} voiceActors(language:JAPANESE){name{full}}}} externalLinks{site url type}}}";
const flights = new WeakMap<object, Map<number, Promise<RecordResult>>>();
export interface RecordResult extends StoredRecord {
  cached: boolean;
}
const nullable = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, 500) : null;
const numeric = (v: unknown): number | null =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : null;
export function toRecord(media: any, id: number): AnimeRecord {
  if (
    !media ||
    media.id !== id ||
    (!media.title?.english && !media.title?.romaji)
  )
    throw new ApiError(502, "upstream");
  const cover = nullable(media.coverImage?.large);
  return {
    id,
    title: nullable(media.title.english) ?? nullable(media.title.romaji)!,
    native: nullable(media.title.native),
    format: nullable(media.format),
    episodes: numeric(media.episodes),
    studios: Array.isArray(media.studios?.nodes)
      ? media.studios.nodes
          .map((n: any) => nullable(n?.name))
          .filter((s: unknown): s is string => typeof s === "string")
      : [],
    year: numeric(media.startDate?.year),
    season: nullable(media.season),
    seasonYear: numeric(media.seasonYear),
    source: nullable(media.source),
    cover: cover?.startsWith("https://") ? cover : null,
    color: nullable(media.coverImage?.color),
    url: `https://anilist.co/anime/${id}`,
    ...(media.idMal !== undefined
      ? { idMal: numeric(media.idMal), details: detailsFromMedia(media) }
      : {}),
    genres: Array.isArray(media.genres)
      ? media.genres.filter((s: unknown) => typeof s === "string").slice(0, 30)
      : [],
  };
}
export async function getRecord(
  id: number,
  store: Store,
  fetcher: Fetcher,
  now = Date.now(),
  deadline?: Deadline,
): Promise<RecordResult> {
  let map = flights.get(store.db);
  if (!map) {
    map = new Map();
    flights.set(store.db, map);
  }
  const current = map.get(id);
  if (current) {
    if (!deadline) return current;
    try {
      return await deadline.run(() => current);
    } catch {
      const saved = await store.getRecord(id);
      if (saved) return { ...saved, cached: true };
      throw new ApiError(502, "upstream");
    }
  }
  const request = load(id, store, fetcher, now, deadline);
  map.set(id, request);
  try {
    return await request;
  } finally {
    map.delete(id);
  }
}
async function load(
  id: number,
  store: Store,
  fetcher: Fetcher,
  now: number,
  deadline?: Deadline,
): Promise<RecordResult> {
  const cached = await store.getRecord(id);
  if (cached && now - cached.fetchedAt < 86400000)
    return { ...cached, cached: true };
  const token = crypto.randomUUID();
  if (!(await store.lease(id, token, now))) {
    if (cached) return { ...cached, cached: true };
    for (let n = 0; n < 12; n++) {
      if (deadline && deadline.remaining <= 0) break;
      await new Promise((r) =>
        setTimeout(r, Math.min(1000, deadline?.remaining ?? 1000)),
      );
      const shared = await store.getRecord(id);
      if (shared) return { ...shared, cached: true };
    }
    throw new ApiError(502, "upstream");
  }
  try {
    const sourceOpen = await store.circuit("anilist");
    if (sourceOpen > Date.now()) {
      if (cached) return { ...cached, cached: true };
      throw new ApiError(
        429,
        "rate_limited",
        Math.ceil((sourceOpen - Date.now()) / 1000),
      );
    }
    if (!(await store.upstream(Date.now()))) {
      if (cached) return { ...cached, cached: true };
      throw new ApiError(429, "rate_limited", 60);
    }
    const retrieve = async (signal: AbortSignal) => {
      const response = await fetcher("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "otaku-oracle/1.0 (+https://github.com/brej-29/otaku-oracle)",
        },
        body: JSON.stringify({ query: QUERY, variables: { id } }),
        signal,
      });
      if (response.status === 429) {
        const until = retryAt(
          response.headers.get("Retry-After"),
          Date.now(),
          60,
        );
        await response.body?.cancel();
        await store.openCircuit("anilist", until);
        throw new ApiError(
          429,
          "rate_limited",
          Math.ceil((until - Date.now()) / 1000),
        );
      }
      if (response.status === 404) throw new ApiError(404, "title_not_found");
      if (!response.ok) {
        console.warn("anilist_status", response.status);
        throw new ApiError(502, "upstream");
      }
      const body = JSON.parse(await readLimited(response, 150000));
      if (body.errors?.some((e: any) => e?.status === 404))
        throw new ApiError(404, "title_not_found");
      if (body.errors) throw new ApiError(502, "upstream");
      if (body.data?.Media === null) throw new ApiError(404, "title_not_found");
      const record = toRecord(body.data?.Media, id);
      const fetchedAt = Date.now();
      await store.putRecord(record, fetchedAt);
      return { record, fetchedAt, cached: false };
    };
    return deadline
      ? await deadline.run(retrieve, 10000)
      : await retrieve(AbortSignal.timeout(10000));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw error;
    if (cached) return { ...cached, cached: true };
    console.warn("anilist_error", String((error as Error)?.message ?? error));
    throw error instanceof ApiError ? error : new ApiError(502, "upstream");
  } finally {
    await store.release(id, token);
  }
}
