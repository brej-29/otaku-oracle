import keywords from "../../shared/claim-keywords.json";
import { normalize } from "./checker";
import type { DraftClaim, Field } from "./types";
export const CLAIM_KEYWORDS: Readonly<Record<Field, readonly string[]>> =
  keywords;
function words(text: string): string[] {
  return (text.match(/[\p{L}\p{N}]+/gu) ?? []).map(normalize).filter(Boolean);
}
export function questionFields(question: string): Set<Field> {
  const tokens = words(question),
    text = ` ${tokens.join(" ")} `;
  return new Set(
    (Object.keys(CLAIM_KEYWORDS) as Field[]).filter((field) =>
      CLAIM_KEYWORDS[field].some((keyword) =>
        keyword.includes(" ")
          ? text.includes(` ${keyword} `)
          : tokens.some((token) => token.startsWith(keyword)),
      ),
    ),
  );
}
function valueAppears(claim: DraftClaim, answer: string): boolean {
  if (!claim.value) return false;
  const answerText = ` ${words(answer).join(" ")} `;
  let values = [claim.value];
  if (claim.field === "studio") {
    try {
      const parsed: unknown = JSON.parse(claim.value);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((v) => typeof v === "string")
      )
        values = parsed;
    } catch {
      /* Literal values still use boundary-aware text matching. */
    }
  }
  return values.every((value) => {
    const phrase = words(value).join(" ");
    return Boolean(phrase) && answerText.includes(` ${phrase} `);
  });
}
export function relevantClaims(
  question: string,
  answer: string,
  claims: DraftClaim[],
): DraftClaim[] {
  const fields = questionFields(question);
  if (fields.size === 0) return claims.slice(0, 3);
  return claims
    .filter(
      (claim) =>
        (claim.field !== null && fields.has(claim.field)) ||
        valueAppears(claim, answer),
    )
    .slice(0, 4);
}
