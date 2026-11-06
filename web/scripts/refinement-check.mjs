import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { routes } from "./fixtures.mjs";
import catalog from "../src/catalog.json" with { type: "json" };
const base = process.env.BASE_URL ?? "http://localhost:4178";
const out = new URL("../../docs/shots/saga/refinement/", import.meta.url);
const path = (name) =>
  new URL(name, out).pathname.replace(/^\/([A-Za-z]:)/, "$1");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
let checks = 0;
const ok = (value, label) => {
  assert.ok(value, label);
  checks++;
};
const sync = async (page) => {
  const current = await page
    .locator(".cover-stack")
    .getAttribute("data-front-id");
  const item = catalog.find((t) => String(t.id) === current);
  ok(!!item, "front is a real bundled title");
  ok(
    (await page.locator(".source-note").getAttribute("data-front-id")) ===
      current,
    "same front and note id",
  );
  ok(
    (await page.locator(".source-note strong").textContent()) === item.title,
    "front title matches note",
  );
  const values = await page.locator(".source-note dd").allTextContents();
  ok(
    values[0] === (item.studio || "Unlisted") &&
      values[1] === String(item.episodes ?? "Unlisted"),
    "note fields match front",
  );
  ok(
    (await page.locator(".source-note a").getAttribute("href")) === item.url,
    "source link matches front",
  );
  const ids = await page
    .locator(".cover-poster")
    .evaluateAll((es) => es.map((e) => e.dataset.titleId));
  ok(new Set(ids).size === 3, "three unique visible titles");
  return {
    id: current,
    title: item.title,
    studio: values[0],
    episodes: values[1],
  };
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await routes(context);
let requests = 0;
context.on("request", (r) => {
  if (
    r.url().includes("graphql.anilist.co") &&
    r.postData()?.includes("popular:Page")
  )
    requests++;
});
const page = await context.newPage();
await page.goto(base + "/?review=1");
await page.evaluate(() => document.fonts.ready);
await page.mouse.move(20, 80);
await page
  .locator(".cover-poster img")
  .evaluateAll(async (imgs) =>
    Promise.all(
      imgs.map((i) =>
        Promise.race([
          i.decode().catch(() => {}),
          new Promise((r) => setTimeout(r, 5000)),
        ]),
      ),
    ),
  );
const states = [];
for (let i = 0; i < 8; i++) {
  if (i)
    await page.waitForFunction(
      (id) => document.querySelector(".cover-stack")?.dataset.frontId !== id,
      states.at(-1).id,
      { timeout: 12000 },
    );
  await page.waitForFunction(
    () => document.querySelector(".cover-stack")?.dataset.phase === "rest",
  );
  states.push(await sync(page));
  await page
    .locator(".hero-art")
    .screenshot({ path: path("shuffle-" + i + ".png") });
  console.log("Shuffle frame " + i + " synchronized");
}
ok(new Set(states.map((s) => s.id)).size === 8, "eight distinct front titles");
ok(requests === 1, "one popular and trending metadata request");
await page.locator(".cover-stack").hover();
const held = await page.locator(".cover-stack").getAttribute("data-front-id");
await page.waitForTimeout(6100);
ok(
  (await page.locator(".cover-stack").getAttribute("data-front-id")) === held,
  "hover pauses",
);
await page.mouse.move(20, 80);
await page.waitForFunction(
  (id) => document.querySelector(".cover-stack")?.dataset.frontId !== id,
  held,
  { timeout: 11000 },
);
ok(true, "hover resumes");
await page.reload();
await page.waitForTimeout(300);
ok(requests === 1, "reload uses six-hour metadata cache");
for (const width of [390, 768, 1440]) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path("hero-" + width + ".png") });
  ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "no overflow " + width,
  );
}
await page.setViewportSize({ width: 1440, height: 900 });
await page.evaluate(() => {
  const e = document.querySelector(".night-journey");
  scrollTo(0, e.offsetTop + (e.offsetHeight - innerHeight) * 0.2);
});
await page.locator(".journey-courier .leg-rig").first().waitFor();
const walk = [];
for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 13);
  await page.waitForTimeout(45);
  const sample = await page
    .locator(".journey-courier .traveller")
    .evaluate((e) => ({
      pose: e.dataset.pose,
      phase: +e.dataset.gaitPhase,
      distance: +e.dataset.gaitDistance,
      svg: e.querySelector("svg").outerHTML,
      legs: [...e.querySelectorAll(".leg-rig")].map((l) => ({
        contact: l.dataset.contact,
        x: +l.dataset.footX,
        y: +l.dataset.footY,
      })),
    }));
  walk.push(sample);
  if (i === 5) await page.screenshot({ path: path("journey-walking.png") });
}
ok(
  walk.some((s) => s.pose === "walking"),
  "walk driven by real scroll",
);
ok(new Set(walk.map((s) => s.phase)).size > 8, "distance changes phase");
ok(
  walk.some((s) => s.legs.some((l) => l.contact === "false")),
  "passing foot lifts",
);
await page.waitForTimeout(700);
ok(
  (await page
    .locator(".journey-courier .traveller")
    .getAttribute("data-pose")) !== "walking",
  "walk stops with scroll",
);
await page.getByRole("button", { name: "Pause motion" }).click();
await page.screenshot({ path: path("journey-paused.png") });
const phase = await page
  .locator(".journey-courier .traveller")
  .getAttribute("data-gait-phase");
await page.waitForTimeout(300);
ok(
  (await page
    .locator(".journey-courier .traveller")
    .getAttribute("data-gait-phase")) === phase,
  "pause keeps rig still",
);
const zoom = await browser.newPage({ viewport: { width: 2240, height: 2850 } });
await zoom.setContent(
  '<style>body{margin:0;background:#efe8dc;font:22px Arial;padding:30px;color:#28212e}h1{font-size:36px}.grid{display:grid;grid-template-columns:repeat(4,520px);gap:20px}.frame{width:520px}svg{width:1040px;height:1240px;display:block;transform:translateX(-260px)}.crop{height:510px;overflow:hidden}.crop svg{margin-top:-730px}g.limb-segment,g.shoe-segment{transform-origin:0 0;transform-box:view-box}.fox-pupils{transform:none}.pose-spark,.thinking-orbit{display:none}p{font-size:18px}</style><h1>Ground-distance walk / four times the 260-unit drawing</h1><p>Actual native-scroll samples. Hip, knee, ankle and planted/swinging feet; upper silhouette is unchanged.</p><div class="grid">' +
    walk
      .slice(0, 12)
      .map(
        (s, i) =>
          '<div class="frame"><div class="crop">' +
          s.svg +
          "</div><p>" +
          i +
          " / phase " +
          s.phase.toFixed(3) +
          " / " +
          s.distance.toFixed(1) +
          " road px</p></div>",
      )
      .join("") +
    "</div>",
);
await zoom.screenshot({ path: path("walk-cycle-4x.png"), fullPage: true });
await zoom.close();
await writeFile(
  path("observations.json"),
  JSON.stringify(
    {
      checks,
      states,
      requests,
      walk: walk.map(({ svg: _svg, ...rest }) => rest),
    },
    null,
    2,
  ) + "\n",
);
await context.close();
const manifest = {
  version: 1,
  image: "test.webp",
  frame: { width: 64, height: 64 },
  columns: 6,
  rows: 1,
  anchor: { x: 0.5, y: 0.94516129 },
  facing: "right",
  walkStride: 76,
  animations: Object.fromEntries(
    ["walk", "idle", "look", "think", "celebrate", "puzzled"].map((n, i) => [
      n,
      { frames: n === "walk" ? [0, 1] : [i], fps: 8, loop: true },
    ]),
  ),
};
const maker = await browser.newPage();
const atlas = await maker.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 64;
  const x = c.getContext("2d");
  for (let i = 0; i < 6; i++) {
    x.fillStyle = [
      "#b32d3b",
      "#d4ac53",
      "#315a51",
      "#324c77",
      "#9d5a77",
      "#44384b",
    ][i];
    x.fillRect(i * 64, 0, 64, 64);
    x.fillStyle = "white";
    x.fillRect(i * 64 + 12, 16, 40, 40);
  }
  return c.toDataURL("image/webp").split(",")[1];
});
await maker.close();
for (const mode of ["valid", "missing", "invalid"]) {
  const c = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await routes(c);
  await c.route("**/mascot/manifest.json", (r) =>
    mode === "missing"
      ? r.fulfill({ status: 404, body: "" })
      : r.fulfill({
          contentType: "application/json",
          body: JSON.stringify(
            mode === "valid" ? manifest : { ...manifest, rows: 0 },
          ),
        }),
  );
  await c.route("**/mascot/test.webp", (r) =>
    r.fulfill({
      contentType: "image/webp",
      body: Buffer.from(atlas, "base64"),
    }),
  );
  const p = await c.newPage();
  await p.goto(base);
  if (mode === "valid")
    await p.locator('.hero-courier[data-renderer="sprite"]').waitFor();
  else await p.waitForTimeout(200);
  ok(
    (await p.locator(".hero-courier").getAttribute("data-renderer")) ===
      (mode === "valid" ? "sprite" : "builtin"),
    "asset " + mode,
  );
  ok(
    (await p.locator(".hero-courier").boundingBox()).height > 150,
    "renderer reserves height " + mode,
  );
  if (mode === "valid") {
    const f = await p
      .locator(".hero-courier")
      .getAttribute("data-sprite-frame");
    await p.waitForTimeout(300);
    ok(
      (await p.locator(".hero-courier").getAttribute("data-sprite-frame")) ===
        f,
      "sprite still with reduced motion",
    );
    await p.setViewportSize({ width: 768, height: 900 });
    ok(
      (await p.locator(".hero-courier").boundingBox()).height > 150,
      "sprite resizes",
    );
  }
  const front = await p.locator(".cover-stack").getAttribute("data-front-id");
  await p.waitForTimeout(5200);
  ok(
    (await p.locator(".cover-stack").getAttribute("data-front-id")) === front,
    "reduced-motion deck is still " + mode,
  );
  await c.close();
}
// A readable missing field must never inherit an earlier front title's value.
const absent = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await routes(absent);
await absent.addInitScript(
  (items) =>
    localStorage.setItem(
      "oracle-showcase-v3",
      JSON.stringify({
        at: Date.now(),
        items: items.map((t) => ({ ...t, studio: null, episodes: null })),
      }),
    ),
  catalog,
);
const ap = await absent.newPage();
await ap.goto(base + "/?review=1");
ok(
  (await ap.locator(".source-note dd").allTextContents()).every(
    (t) => t === "Unlisted",
  ),
  "missing fields display Unlisted",
);
await ap.screenshot({ path: path("source-unlisted.png") });
await absent.close();
const limited = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await routes(limited);
let failedCalls = 0;
await limited.route("https://graphql.anilist.co", (route) => {
  if (route.request().postData()?.includes("popular:Page")) {
    failedCalls++;
    return route.fulfill({ status: 429, body: "{}" });
  }
  return route.fallback();
});
const lp = await limited.newPage();
await lp.goto(base + "/?review=1");
await lp.waitForFunction(() => localStorage.getItem("oracle-showcase-v3"));
ok(failedCalls === 1, "rate-limited metadata makes no retry storm");
ok(
  (await lp.locator(".cover-poster").count()) === 3,
  "rate-limited metadata retains real fallback covers",
);
await lp.screenshot({ path: path("fallback-429.png") });
await limited.close();
await browser.close();
await writeFile(
  path("checks.json"),
  JSON.stringify({ checks, passed: true }, null, 2) + "\n",
);
console.log(checks + " refinement checks passed");
