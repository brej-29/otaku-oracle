import { expect, it } from "vitest";
import { questionFields, relevantClaims } from "../src/relevance";
import type { DraftClaim } from "../src/types";
const claims: DraftClaim[] = [
  {
    field: "studio",
    value: '["MADHOUSE"]',
    text: "Animation studios: MADHOUSE.",
  },
  { field: "episodes", value: "28", text: "Episode count: 28." },
  { field: "format", value: "TV", text: "Format: TV." },
  { field: "source", value: "MANGA", text: "Source material: MANGA." },
  { field: "season", value: "FALL", text: "Season: FALL." },
  { field: "year", value: "2023", text: "Start year: 2023." },
];
it("keeps only studio for a studio-only question", () =>
  expect(
    relevantClaims(
      "Which studio animated it?",
      "MADHOUSE animated it.",
      claims,
    ).map((c) => c.field),
  ).toEqual(["studio"]));
it("keeps exactly the two requested fields and trims padded output", () =>
  expect(
    relevantClaims(
      "Which studio animated it and how many episodes does it have?",
      "MADHOUSE animated its 28 episodes.",
      claims,
    ).map((c) => c.field),
  ).toEqual(["studio", "episodes"]));
it("caps an unmappable question at three claims", () =>
  expect(
    relevantClaims("Tell me about it.", "A short answer.", claims),
  ).toEqual(claims.slice(0, 3)));
it("allows another field only when its value appears in the short answer", () =>
  expect(
    relevantClaims(
      "Which studio animated it?",
      "MADHOUSE made the TV anime.",
      claims,
    ).map((c) => c.field),
  ).toEqual(["studio", "format"]));
it("requires all studio names in a set to appear in the answer", () => {
  const multiple: DraftClaim = {
    field: "studio",
    value: '["Sunrise","Bones"]',
    text: "Two studios",
  };
  expect(
    relevantClaims("What year did it start?", "Sunrise worked on it.", [
      multiple,
    ]),
  ).toEqual([]);
  expect(
    relevantClaims(
      "What year did it start?",
      "Sunrise and Bones worked on it.",
      [multiple],
    ),
  ).toEqual([multiple]);
});
it("does not retain numeric substring matches or empty values", () => {
  const list: DraftClaim[] = [
    { field: "episodes", value: "28", text: "28 episodes" },
    { field: null, value: null, text: "Unknown" },
  ];
  expect(relevantClaims("Which studio?", "Studio 1280 made it.", list)).toEqual(
    [],
  );
});
it("preserves value matches despite case, accents and punctuation", () =>
  expect(
    relevantClaims("What year?", "The source is a light novel.", [
      { field: "source", value: "LIGHT_NOVEL", text: "Source" },
    ]),
  ).toHaveLength(1));
it("caps even fully relevant padding at four claims", () =>
  expect(
    relevantClaims(
      "Which studio and episode, format, source, season, year?",
      "All fields.",
      claims,
    ),
  ).toHaveLength(4));
it.each([
  ["Who produced it?", "studio"],
  ["Who made it?", "studio"],
  ["How long is it?", "episodes"],
  ["When did it air?", "year"],
  ["Is it a movie, film, TV series or OVA?", "format"],
  ["Was it adapted or based on an original manga or novel?", "source"],
  ["Which season?", "season"],
])("maps %s", (question, field) =>
  expect(questionFields(question).has(field as any)).toBe(true),
);
it("matches keyword word starts rather than embedded substrings", () =>
  expect(questionFields("Do I belong here?").size).toBe(0));
it("does not mutate the model claims array", () => {
  const before = JSON.stringify(claims);
  relevantClaims("Which studio?", "MADHOUSE", claims);
  expect(JSON.stringify(claims)).toBe(before);
});
