import { normalize } from "./checker";
import type { AnimeRecord, Claim, Draft } from "./types";
const scaffold = new Set(
  "a an the is was were are be been being it its this that there they their has have had of and or in for with on as at from to by according record anilist lists listed says shows total animation animated animate studio studios episodes episode count start started aired air year release released format source material season original also anime series title".split(
    " ",
  ),
);
function tokens(text: string): string[] {
  return (text.match(/[\p{L}\p{N}]+/gu) ?? []).map(normalize).filter(Boolean);
}
// Conservative lexical novelty, never semantic/model grading. Short answers are
// already represented by claims; only optional commentary can add context.
export function explanation(
  draft: Draft,
  claims: Claim[],
  record: AnimeRecord,
): string | null {
  if (!draft.explanation?.trim()) return null;
  const known = new Set([
    ...scaffold,
    ...tokens(record.title),
    ...claims.flatMap((c) =>
      tokens([c.text, c.value, c.recordValue].filter(Boolean).join(" ")),
    ),
  ]);
  const seen = new Set<string>();
  const novel = draft.explanation
    .trim()
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((sentence) => {
      const words = tokens(sentence),
        key = normalize(sentence);
      if (seen.has(key)) return false;
      seen.add(key);
      return (
        words.length >= 4 &&
        new Set(words.filter((w) => !known.has(w))).size >= 2
      );
    });
  return novel.length ? novel.join(" ") : null;
}
