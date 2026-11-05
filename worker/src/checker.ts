import unicode from "./unicode.json";
import {
  FIELDS,
  type AnimeRecord,
  type Claim,
  type DraftClaim,
  type Field,
} from "./types";
const folds: Record<string, string> = unicode.casefold;
const digits: Record<string, string> = unicode.digits;
// Full Unicode folding, not locale-dependent lowercasing; mirrors eval/scoring.py.
export function normalize(value: unknown): string {
  return [...String(value).normalize("NFKD")]
    .map((c) => folds[c] ?? c.toLowerCase())
    .join("")
    .replace(/[^\p{L}\p{N}]/gu, "");
}
export function integer(value: unknown): bigint | null {
  if (typeof value === "number")
    return Number.isSafeInteger(value) ? BigInt(value) : null;
  if (typeof value !== "string") return null;
  const trimmed = value.replace(
    /^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
    "",
  );
  const text = [...trimmed].map((c) => digits[c] ?? c).join("");
  return /^[+-]?[0-9]+$/.test(text) ? BigInt(text) : null;
}
export function exact(field: Field, answer: unknown, gold: unknown): boolean {
  if (field === "episodes" || field === "year") {
    const n = integer(answer);
    return n !== null && n === integer(gold);
  }
  if (field === "studio") {
    if (
      !Array.isArray(answer) ||
      !answer.every((x) => typeof x === "string") ||
      !Array.isArray(gold)
    )
      return false;
    const a = new Set(answer.map(normalize)),
      b = new Set(gold.map(normalize));
    return a.size === b.size && [...a].every((x) => b.has(x));
  }
  return typeof answer === "string" && normalize(answer) === normalize(gold);
}
export function recordValue(record: AnimeRecord, field: Field): string | null {
  const val = field === "studio" ? record.studios : record[field];
  return val === null ||
    val === undefined ||
    val === "" ||
    (Array.isArray(val) && val.length === 0)
    ? null
    : Array.isArray(val)
      ? JSON.stringify(val)
      : String(val);
}
function studioValue(value: string | null): unknown {
  try {
    return JSON.parse(value ?? "null");
  } catch {
    return null;
  }
}
const labels: Record<Field, string> = {
  studio: "Animation studios",
  episodes: "Episode count",
  year: "Start year",
  format: "Format",
  source: "Source material",
  season: "Season",
};
export function checkClaim(
  record: AnimeRecord,
  claim: DraftClaim,
  index: number,
): Claim {
  const field = claim.field;
  const gold = field ? recordValue(record, field) : null;
  const answer = field === "studio" ? studioValue(claim.value) : claim.value;
  const expected =
    field === "studio" ? record.studios : field ? record[field] : null;
  const status =
    field === null || gold === null || claim.value === null
      ? "unchecked"
      : exact(field, answer, expected)
        ? "verified"
        : "conflict";
  // Never badge arbitrary model text: templates express only the compared value.
  const text =
    field && claim.value !== null
      ? `${labels[field]}: ${field === "studio" && Array.isArray(answer) && answer.every((v) => typeof v === "string") ? answer.join(", ") : claim.value}.`
      : claim.text;
  return {
    id: `claim-${index + 1}`,
    text,
    field,
    value: claim.value,
    status,
    recordValue: gold,
    sourceUrl: record.url,
  };
}
export function recordClaims(record: AnimeRecord): Claim[] {
  return FIELDS.filter((f) => recordValue(record, f) !== null).map((field, i) =>
    checkClaim(
      record,
      { field, value: recordValue(record, field), text: "" },
      i,
    ),
  );
}
