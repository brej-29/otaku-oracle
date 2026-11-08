import { expect, it } from "vitest";
import { splitStudios } from "../src/anilist";

it("separates main studios from producers by the isMain flag", () => {
  const media = splitStudios({
    studios: {
      edges: [
        { isMain: true, node: { name: "8-bit", isAnimationStudio: true } },
        {
          isMain: false,
          node: { name: "Funimation", isAnimationStudio: false },
        },
      ],
    },
  });
  expect(media.studios.nodes.map((n: any) => n.name)).toEqual(["8-bit"]);
  expect(media.producers.nodes.map((n: any) => n.name)).toEqual(["Funimation"]);
});
