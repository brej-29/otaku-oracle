import type { Claim, MediaRecord } from "./api";

const title = (s: string) => s.toLowerCase().replace(/(^|[\s_-])\w/g, (m) => m.toUpperCase()).replace(/_/g, " ");
const studios = (v: string | null): string[] => {
  if (!v) return [];
  try { const j = JSON.parse(v); if (Array.isArray(j)) return j.map(String); } catch { /* plain string */ }
  return [v];
};
const list = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** Turns a checked claim into a plain sentence. Falls back to the service's own text when the field is unknown. */
export function sentence(c: Claim, r: MediaRecord): string {
  const v = c.value ?? c.recordValue;
  if (!v) return c.text;
  switch (c.field) {
    case "studio": return `${r.title} was animated by ${list(studios(v))}.`;
    case "episodes": return `${r.title} has ${v} episode${v === "1" ? "" : "s"}.`;
    case "year": return `${r.title} started airing in ${v}.`;
    case "format": return `${r.title} is a ${/^[A-Z]{2,3}$/.test(v) ? v : title(v)} release.`;
    case "source": return `${r.title} is adapted from a ${title(v).toLowerCase()} source.`;
    case "season": return `${r.title} aired in ${title(v)}${r.seasonYear && !/\d{4}/.test(v) ? ` ${r.seasonYear}` : ""}.`;
    default: return c.text;
  }
}

/** What the record says for a conflicting claim, in the same readable form. */
export function recordSays(c: Claim): string {
  const v = c.recordValue ?? "";
  return c.field === "studio" ? list(studios(v)) : /^[A-Z_]{3,}$/.test(v) ? title(v) : v;
}
