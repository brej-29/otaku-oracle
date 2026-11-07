import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

// The Workers runtime throws on redirect:"error"; mocked fetchers cannot catch that.
it("never uses an unsupported redirect mode", () => {
  for (const f of ["sources", "anilist", "providers"])
    expect(readFileSync(`src/${f}.ts`, "utf8")).not.toMatch(
      /redirect:\s*"error"/,
    );
});
