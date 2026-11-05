import { expect, it } from "vitest";
import { explanation } from "../src/explanation";
import { checkClaim } from "../src/checker";
import { draft, record } from "./fixtures";
const claims = [
  checkClaim(
    record,
    { field: "studio", text: "Sunrise animated it", value: '["Sunrise"]' },
    0,
  ),
  checkClaim(
    record,
    { field: "episodes", text: "26 episodes", value: "26" },
    1,
  ),
];
it.each([
  null,
  "",
  "Sunrise",
  "Animation studios: Sunrise.",
  "The anime was animated by Sunrise.",
  "It has 26 episodes.",
  "Sunrise. Episode count: 26.",
])("drops repeated claim commentary %s", (text) => {
  expect(
    explanation(
      { ...draft, answer: "Sunrise", explanation: text },
      claims,
      record,
    ),
  ).toBeNull();
});
it("does not duplicate the short answer when optional commentary is absent", () =>
  expect(
    explanation(
      { ...draft, answer: "Sunrise", explanation: null },
      claims,
      record,
    ),
  ).toBeNull());
it("retains novel context as unverified prose", () =>
  expect(
    explanation(
      { ...draft, explanation: "Sunrise was founded in 1972." },
      claims,
      record,
    ),
  ).toBe("Sunrise was founded in 1972."));
it("removes repeated sentences while retaining novel context once", () =>
  expect(
    explanation(
      {
        ...draft,
        explanation:
          "It has 26 episodes. Sunrise was founded in 1972. Sunrise was founded in 1972.",
      },
      claims,
      record,
    ),
  ).toBe("Sunrise was founded in 1972."));
it("requires two distinct new substantive tokens and at least four tokens", () =>
  expect(
    explanation(
      { ...draft, explanation: "It has exactly 26 episodes." },
      claims,
      record,
    ),
  ).toBeNull());
it("does not change claim state when retaining new prose", () => {
  const before = JSON.stringify(claims);
  explanation(
    { ...draft, explanation: "Sunrise was founded in 1972." },
    claims,
    record,
  );
  expect(JSON.stringify(claims)).toBe(before);
});
