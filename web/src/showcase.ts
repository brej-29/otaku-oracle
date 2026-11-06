import catalog from "./catalog.json" with { type: "json" };
import type { Hit } from "./api";
export type ShowcaseTitle = Hit & {
  studio: string | null;
  episodes: number | null;
  url: string;
  banner: string | null;
  popularity?: number | null;
};
export const fallbackTitles: ShowcaseTitle[] = catalog;
const KEY = "oracle-showcase-v3";
const TTL = 6 * 60 * 60 * 1000;
type Cache = { at: number; items: ShowcaseTitle[]; fallback?: boolean };
const image = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      (u.hostname === "anilist.co" || u.hostname.endsWith(".anilist.co"))
      ? u.href
      : null;
  } catch {
    return null;
  }
};
export function normalizeTitles(values: unknown): ShowcaseTitle[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<number>(),
    out: ShowcaseTitle[] = [];
  for (const m of values) {
    if (
      !m ||
      typeof m !== "object" ||
      !Number.isSafeInteger(m.id) ||
      m.id <= 0 ||
      seen.has(m.id) ||
      typeof m.title !== "string" ||
      !m.title.trim()
    )
      continue;
    seen.add(m.id);
    out.push({
      id: m.id,
      title: m.title.slice(0, 300),
      cover: image(m.cover),
      smallCover: image(m.smallCover),
      banner: image(m.banner),
      year: Number.isInteger(m.year) ? m.year : null,
      format: typeof m.format === "string" ? m.format : null,
      color:
        typeof m.color === "string" && /^#[0-9a-f]{6}$/i.test(m.color)
          ? m.color
          : null,
      studio:
        typeof m.studio === "string" && m.studio.trim()
          ? m.studio.slice(0, 400)
          : null,
      episodes:
        Number.isInteger(m.episodes) && m.episodes >= 0 ? m.episodes : null,
      url: "https://anilist.co/anime/" + m.id,
      popularity: typeof m.popularity === "number" ? m.popularity : null,
    });
  }
  return out;
}
export function readShowcaseCache(
  storage?: Pick<Storage, "getItem">,
  now = Date.now(),
): ShowcaseTitle[] | null {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cache;
    const items = normalizeTitles(c.items);
    return Number.isFinite(c.at) &&
      now - c.at >= 0 &&
      now - c.at < (c.fallback ? 60000 : TTL) &&
      items.length >= 20
      ? items
      : null;
  } catch {
    return null;
  }
}
function storage() {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
}
export function initialShowcase() {
  return readShowcaseCache(storage()) ?? fallbackTitles;
}
const fields =
  "id title{romaji english} startDate{year} format popularity coverImage{large medium color} bannerImage studios(isMain:true){nodes{name}} episodes";
export const SHOWCASE_QUERY =
  "query{popular:Page(perPage:20){media(type:ANIME,isAdult:false,sort:POPULARITY_DESC){" +
  fields +
  "}}trending:Page(perPage:20){media(type:ANIME,isAdult:false,sort:TRENDING_DESC){" +
  fields +
  "}}}";
let request: Promise<ShowcaseTitle[]> | undefined;
export function loadShowcase(): Promise<ShowcaseTitle[]> {
  if (request) return request;
  const cached = readShowcaseCache(storage());
  if (cached) return (request = Promise.resolve(cached));
  request = (async () => {
    let items = fallbackTitles,
      failed = true;
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: SHOWCASE_QUERY }),
        signal: AbortSignal.timeout(8000),
        priority: "low",
      });
      if (res.ok) {
        const j = await res.json(),
          media = [
            ...(j.data?.popular?.media ?? []),
            ...(j.data?.trending?.media ?? []),
          ];
        const live = normalizeTitles(
          media.map((m) => ({
            id: m.id,
            title: m.title?.english || m.title?.romaji,
            year: m.startDate?.year,
            format: m.format,
            cover: m.coverImage?.large,
            smallCover: m.coverImage?.medium,
            color: m.coverImage?.color,
            banner: m.bannerImage,
            studio: (m.studios?.nodes ?? [])
              .map((s: { name: string }) => s.name)
              .join(", "),
            episodes: m.episodes,
            popularity: m.popularity,
          })),
        );
        if (live.length) {
          items = normalizeTitles([...live, ...fallbackTitles]);
          failed = false;
        }
      }
    } catch {
      /* The real bundled records remain available without a request retry. */
    }
    try {
      storage()?.setItem(
        KEY,
        JSON.stringify({ at: Date.now(), items, fallback: failed }),
      );
    } catch {
      /* Storage may be unavailable. */
    }
    return items;
  })();
  return request;
}
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export class TitleDeck {
  pool: ShowcaseTitle[];
  queue: ShowcaseTitle[];
  seen: Set<number>;
  random: () => number;
  constructor(
    pool: ShowcaseTitle[],
    visible: ShowcaseTitle[],
    random = Math.random,
  ) {
    this.pool = pool;
    this.random = random;
    this.seen = new Set(visible.map((t) => t.id));
    this.queue = shuffled(
      pool.filter((t) => !this.seen.has(t.id)),
      random,
    );
  }
  update(pool: ShowcaseTitle[], visible: ShowcaseTitle[]) {
    this.pool = pool;
    const eligible = pool.filter(
      (t) => !this.seen.has(t.id) && !visible.some((v) => v.id === t.id),
    );
    this.queue = shuffled(eligible, this.random);
  }
  next(visible: ShowcaseTitle[]): ShowcaseTitle | null {
    const ids = new Set(visible.map((t) => t.id));
    this.queue = this.queue.filter((t) => !ids.has(t.id));
    if (!this.queue.length) {
      this.seen = new Set(ids);
      this.queue = shuffled(
        this.pool.filter((t) => !ids.has(t.id)),
        this.random,
      );
    }
    const title = this.queue.shift() ?? null;
    if (title) this.seen.add(title.id);
    return title;
  }
}
