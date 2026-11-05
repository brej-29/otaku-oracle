import { describe, it, expect } from "vitest";
import {
  checkClaim,
  exact,
  integer,
  normalize,
  recordClaims,
} from "../src/checker";
import { parseDraft } from "../src/parse";
import { record, draft } from "./fixtures";
describe("exact scorer parity", () => {
  it.each([
    [12, true],
    [" 12 ", true],
    ["12 episodes", false],
    [true, false],
    ["12.4", false],
    [11, false],
    ["12.0", false],
    ["+0012", true],
    ["\u008512\u001c", true],
    ["\u0661\u0662", true],
  ])("numeric %s", (answer, expected) =>
    expect(exact("episodes", answer, 12)).toBe(expected),
  );
  it("rejects floats, boolean, empty strings and nonfinite values", () => {
    for (const v of [12.4, true, "", NaN, Infinity, null, "\ufeff12"])
      expect(integer(v)).toBe(null);
  });
  it("uses complete studio sets, not fuzzy matches", () => {
    expect(
      exact(
        "studio",
        ["Toei Animation", "Studio 4\u00b0C"],
        ["STUDIO 4\u00b0C", "Toei-Animation"],
      ),
    ).toBe(true);
    expect(exact("studio", ["Pok\u00e9mon"], ["Pokemon"])).toBe(true);
    expect(exact("studio", ["Toei"], ["Toei Animation"])).toBe(false);
    expect(exact("studio", "Toei Animation", ["Toei Animation"])).toBe(false);
    expect(exact("studio", ["A"], ["A", "B"])).toBe(false);
    expect(exact("studio", ["A", "A"], ["A"])).toBe(true);
  });
  it("normalizes categories without semantic synonyms", () => {
    expect(exact("source", "light novel", "LIGHT_NOVEL")).toBe(true);
    expect(exact("format", "tv-short", "TV_SHORT")).toBe(true);
    expect(exact("season", "autumn", "FALL")).toBe(false);
  });
  it("preserves full Unicode casefold and compatibility parity", () => {
    expect(normalize("Stra\u00dfe \u03a3\u03c2 Pok\u00e9mon \u2163")).toBe(
      normalize("STRASSE \u03c3\u03c3 Pokemon IV"),
    );
    expect(normalize("\u13a0")).toBe(normalize("\uab70"));
  });
});
describe("claim states and text boundaries", () => {
  it("verifies matching values and uses safe canonical text", () => {
    const c = checkClaim(
      record,
      {
        text: "Actually 50 episodes and released in 2020",
        field: "episodes",
        value: "26",
      },
      0,
    );
    expect(c.status).toBe("verified");
    expect(c.text).toBe("Episode count: 26.");
    expect(c.text).not.toContain("2020");
  });
  it("records a contradiction and the linked gold value", () => {
    expect(
      checkClaim(
        record,
        { text: "12 episodes", field: "episodes", value: "12" },
        1,
      ),
    ).toMatchObject({
      id: "claim-2",
      status: "conflict",
      recordValue: "26",
      sourceUrl: record.url,
    });
  });
  it.each([
    { field: null, value: "great", text: "It is wonderful." },
    { field: "year", value: null, text: "Unknown year" },
  ] as const)("retains unchecked assertions", (c) =>
    expect(checkClaim(record, c, 0).status).toBe("unchecked"),
  );
  it("leaves missing record fields unchecked", () => {
    expect(
      checkClaim(
        { ...record, year: null },
        { field: "year", value: "1998", text: "1998" },
        0,
      ).status,
    ).toBe("unchecked");
    expect(
      checkClaim(
        { ...record, studios: [] },
        { field: "studio", value: '["Sunrise"]', text: "Sunrise" },
        0,
      ).status,
    ).toBe("unchecked");
  });
  it("checks studio JSON sets without comma ambiguity", () => {
    expect(
      checkClaim(
        record,
        { field: "studio", value: '["sunrise"]', text: "Sunrise" },
        0,
      ).status,
    ).toBe("verified");
    expect(
      checkClaim(
        record,
        { field: "studio", value: "Sunrise", text: "Sunrise" },
        0,
      ).status,
    ).toBe("conflict");
  });
  it("deterministic fallback contains only available verified fields", () => {
    const claims = recordClaims({ ...record, year: null });
    expect(claims).toHaveLength(5);
    expect(claims.every((c) => c.status === "verified")).toBe(true);
  });
});
describe("strict JSON transport", () => {
  it("accepts the complete bare object", () =>
    expect(parseDraft(JSON.stringify(draft))).toEqual(draft));
  it.each([
    "no",
    "[]",
    "{}",
    "```json\n" + JSON.stringify(draft) + "\n```",
    "",
    JSON.stringify({ ...draft, claims: [] }),
    JSON.stringify({
      ...draft,
      claims: [{ field: "episodes", value: 26, text: "26" }],
    }),
    JSON.stringify({
      ...draft,
      claims: [{ field: "staff", value: "X", text: "X" }],
    }),
  ])("rejects malformed/fenced/untyped output", (s) =>
    expect(() => parseDraft(s)).toThrow(),
  );
});

it("cannot invoke object methods through an untrusted studio value", () => {
  expect(
    checkClaim(
      record,
      { field: "studio", value: '[{"toString":null}]', text: "Untrusted" },
      0,
    ).status,
  ).toBe("conflict");
});
