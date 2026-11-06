import test from "node:test";
import assert from "node:assert/strict";
import { STRIDE, gait, knee, foot } from "../src/mascot/gait.ts";
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
test("stance feet remain planted as the body travels", () => {
  for (const start of [0, 0.5]) {
    const samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((p) => {
      const d = (p + start) * STRIDE;
      const f = foot(p, 113);
      return f.x + d;
    });
    assert.ok(Math.max(...samples) - Math.min(...samples) < 1e-8);
  }
});
test("hip, knee and ankle have physical segment lengths", () => {
  for (let i = 0; i < 32; i++) {
    const g = gait((i * STRIDE) / 32);
    for (const leg of [g.left, g.right]) {
      assert.ok(
        Math.abs(
          Math.hypot(leg.knee.x - leg.hip.x, leg.knee.y - leg.hip.y) - 28,
        ) < 1e-8,
      );
      assert.ok(
        Math.abs(
          Math.hypot(leg.ankle.x - leg.knee.x, leg.ankle.y - leg.knee.y) - 29,
        ) < 0.002,
      );
    }
  }
});
test("contact, down, passing and up change height and swing clearance", () => {
  assert.equal(gait(0).bob, 0);
  assert.ok(gait(STRIDE * 0.125).bob > 1.9);
  assert.ok(gait(STRIDE * 0.375).bob < -1.9);
  assert.ok(foot(0.81, 113).y < 265);
  assert.equal(foot(0.2, 113).y, 281);
});
test("gait remains finite in reverse and settles to the same idle anchors", () => {
  for (const d of [-1000, -50, 0, 1234]) {
    const g = gait(d, 0);
    assert.equal(g.left.ankle.x, 107);
    assert.equal(g.right.ankle.x, 150);
    assert.equal(g.left.ankle.y, 281);
    assert.ok(Number.isFinite(knee(g.left.hip, g.left.ankle).x));
  }
});
const manifest = () => ({
  version: 1,
  image: "nori.webp",
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
  assert.equal(m.image, "http://localhost/mascot/nori.webp");
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
