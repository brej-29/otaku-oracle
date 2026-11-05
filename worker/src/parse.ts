import { FIELDS, type Draft, type DraftClaim } from "./types";
function object(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
export function parseDraft(content: unknown): Draft {
  // Fences are deliberately not stripped: identical transport rule to the eval scorer.
  if (typeof content !== "string" || content.length > 20000)
    throw new Error("invalid_output");
  const x: unknown = JSON.parse(content);
  if (
    !object(x) ||
    typeof x.answer !== "string" ||
    !x.answer.trim() ||
    x.answer.length > 2000 ||
    !Array.isArray(x.claims) ||
    x.claims.length < 1 ||
    x.claims.length > 12 ||
    (x.explanation !== null &&
      x.explanation !== undefined &&
      typeof x.explanation !== "string")
  )
    throw new Error("invalid_output");
  const claims = x.claims.map((c: unknown): DraftClaim => {
    if (
      !object(c) ||
      typeof c.text !== "string" ||
      !c.text.trim() ||
      c.text.length > 500 ||
      (c.field !== null && !FIELDS.includes(c.field as never)) ||
      (c.value !== null && typeof c.value !== "string") ||
      (typeof c.value === "string" && c.value.length > 500)
    )
      throw new Error("invalid_claim");
    return {
      text: c.text,
      field: c.field as DraftClaim["field"],
      value: c.value as string | null,
    };
  });
  if (typeof x.explanation === "string" && x.explanation.length > 4000)
    throw new Error("invalid_output");
  return {
    answer: x.answer,
    claims,
    explanation: typeof x.explanation === "string" ? x.explanation : null,
  };
}
export async function readLimited(
  response: Pick<Response, "body">,
  limit: number,
  signal?: AbortSignal,
): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      signal?.throwIfAborted();
      const { value, done } = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("body_limit");
      chunks.push(value);
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
  }
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(merged);
}
