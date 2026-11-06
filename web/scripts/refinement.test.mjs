import test from "node:test";
import assert from "node:assert/strict";
import { validateAsset, frameFor } from "../src/mascot/assets.ts";
import {
  fallbackTitles,
  normalizeTitles,
  readShowcaseCache,
  shuffled,
  TitleDeck,
} from "../src/showcase.ts";
test("fallback includes at least twenty unique real records", () => {
  assert.ok(fallbackTitles.length >= 20);
  assert.equal(
    new Set(fallbackTitles.map((t) => t.id)).size,
    fallbackTitles.length,
  );
  assert.ok(fallbackTitles.every((t) => t.url.includes("/anime/" + t.id)));
});
test("one deck cycles many titles with no duplicate visible card", () => {
  let visible = fallbackTitles.slice(0, 3);
  const seen = new Set(visible.map((t) => t.id));
  const deck = new TitleDeck(fallbackTitles, visible, () => 0.37);
  for (let i = 0; i < 60; i++) {
    const next = deck.next(visible);
    assert.ok(next);
    assert.ok(!visible.some((t) => t.id === next.id));
    visible = [visible[1], visible[2], next];
    assert.equal(new Set(visible.map((t) => t.id)).size, 3);
    seen.add(next.id);
  }
  assert.equal(seen.size, fallbackTitles.length);
});
test("shuffle depends on visit randomness without mutating the source", () => {
  const a = shuffled(fallbackTitles, () => 0.1),
    b = shuffled(fallbackTitles, () => 0.9);
  assert.notDeepEqual(
    a.map((t) => t.id),
    b.map((t) => t.id),
  );
  assert.notEqual(a, fallbackTitles);
});
test("missing real fields remain unlisted values and unsafe image URLs are removed", () => {
  const out = normalizeTitles([
    {
      id: 1,
      title: "Title",
      episodes: null,
      studio: "",
      cover: "javascript:alert(1)",
    },
    { id: 1, title: "Duplicate" },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].studio, null);
  assert.equal(out[0].episodes, null);
  assert.equal(out[0].cover, null);
});
test("pool cache expires and malformed storage fails closed", () => {
  const now = 10000000,
    items = fallbackTitles;
  assert.equal(
    readShowcaseCache(
      { getItem: () => JSON.stringify({ at: now - 7 * 3600000, items }) },
      now,
    ),
    null,
  );
  assert.equal(readShowcaseCache({ getItem: () => "{bad" }, now), null);
  assert.equal(
    readShowcaseCache(
      { getItem: () => JSON.stringify({ at: now, items }) },
      now,
    ).length,
    items.length,
  );
});
const manifest = () => ({
  version: 1,
  image: "wanderer.webp",
  frame: { width: 256, height: 320 },
  columns: 8,
  rows: 8,
  anchor: { x: 0.5, y: 0.945 },
  facing: "right",
  walkStride: 160,
  animations: Object.fromEntries(
    ["walk", "idle", "look", "think", "celebrate", "puzzled"].map((name) => [
      name,
      {
        frames:
          name === "walk"
            ? Array.from({ length: 16 }, (_, i) => i)
            : [16, 17, 18, 19],
        fps: 12,
        loop: true,
      },
    ]),
  ),
});
test("valid drop-in sprite manifest resolves within its folder", () => {
  const m = validateAsset(manifest());
  assert.ok(m);
  assert.equal(m.image, "http://localhost/mascot/wanderer.webp");
});
test("missing states, oversize atlases and off-origin images use the builtin fallback", () => {
  let m = manifest();
  delete m.animations.think;
  assert.equal(validateAsset(m), null);
  m = manifest();
  m.rows = 32;
  assert.equal(validateAsset(m), null);
  m = manifest();
  m.image = "https://elsewhere.test/x.webp";
  assert.equal(validateAsset(m), null);
  m = manifest();
  m.image = "../outside.webp";
  assert.equal(validateAsset(m), null);
  assert.equal(validateAsset({ version: 1, enabled: false }), null);
});
test("sprite walk frames are distance-locked and reduced motion is still", () => {
  const m = validateAsset(manifest());
  assert.equal(frameFor(m, "walk", 0, 0, 1, true), 0);
  assert.equal(frameFor(m, "walk", 5000, 0, 1, true), 0);
  assert.equal(frameFor(m, "walk", 0, 80, 1, true), 8);
  assert.equal(frameFor(m, "think", 1000, 0, 1, false), 16);
});

const supplied = JSON.parse(
  await (
    await import("node:fs/promises")
  ).readFile(
    new URL("../public/mascot/manifest.json", import.meta.url),
    "utf8",
  ),
);
test("owner pack validates without fixing its dimensions or frame map", () => {
  const m = validateAsset(supplied);
  assert.ok(m);

  assert.equal(
    frameFor(m, "idle", 0, 0, 1, false),
    m.animations.idle.frames[0],
  );
  assert.ok(
    m.animations.think.frames.includes(frameFor(m, "think", 100, 0, 1, true)),
  );
});
