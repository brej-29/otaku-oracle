import { expect, it } from "vitest";
import { classify } from "../src/classify";

it("flags source-adaptation coverage questions as unsupported", () => {
  for (const q of [
    "How much of the light novel has come out as anime",
    "how far does the anime cover the manga?",
    "Has it caught up to the manga chapters",
  ])
    expect(classify(q)).toMatchObject({ kind: "unclear", unsupported: true });
});

it("still answers ordinary source questions", () => {
  expect(classify("Is it based on a light novel?")).toMatchObject({
    kind: "fact",
    fields: ["source"],
  });
});
