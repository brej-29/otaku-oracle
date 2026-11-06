import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { routes, submit } from "./fixtures.mjs";
const root = new URL("../../docs/shots/saga/samurai/", import.meta.url);
await mkdir(root, { recursive: true });
const path = (n) => new URL(n, root).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const b = await chromium.launch({ channel: "msedge" });
let checks = 0;
const ok = (v, m) => {
  assert.ok(v, m);
  checks++;
};
const base = process.env.BASE_URL ?? "http://localhost:4178";
for (const width of [390, 768, 1440]) {
  const c = await b.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  await routes(c);
  const p = await c.newPage();
  await p.clock.install();
  await p.goto(base + "/?review=1");
  await p.locator('.hero-courier[data-renderer="sprite"]').waitFor();
  await p.evaluate(() => document.fonts.ready);
  await p.mouse.move(10, 10);
  await p.clock.runFor(450);
  const hero = p.locator(".hero-courier");
  const advanceTo = async (action) => {
    for (let n = 0; n < 140; n++) {
      if ((await hero.getAttribute("data-action")) === action) return;
      await p.clock.runFor(200);
    }
    throw new Error("Idle action did not appear: " + action);
  };
  ok(
    (await hero.getAttribute("data-sprite-frame")) === "8",
    "idle atlas frame " + width,
  );
  await p
    .locator(".cover-stack img")
    .evaluateAll(async (images) =>
      Promise.all(
        images.map((image) =>
          Promise.race([
            image.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, 6000)),
          ]),
        ),
      ),
    );
  await advanceTo("idle");
  await p.screenshot({ path: path("idle-" + width + ".png") });
  await p.getByRole("combobox").focus();
  await p.clock.runFor(50);
  ok(
    (await hero.getAttribute("data-action")) === "puzzled",
    "search focus gestures " + width,
  );
  await hero.screenshot({ path: path("gesture-" + width + ".png") });
  await p.getByRole("combobox").blur();
  await advanceTo("look");
  ok(
    (await hero.getAttribute("data-action")) === "look",
    "periodic glance " + width,
  );
  await hero.screenshot({ path: path("look-" + width + ".png") });
  await advanceTo("think");
  ok(
    (await hero.getAttribute("data-action")) === "think",
    "periodic thought " + width,
  );
  await hero.screenshot({ path: path("think-" + width + ".png") });
  await advanceTo("celebrate");
  await p.clock.runFor(400);
  await p.clock.pauseAt(new Date(await p.evaluate(() => Date.now())));
  ok(
    (await hero.getAttribute("data-action")) === "celebrate",
    "rare flourish " + width,
  );
  await hero.screenshot({ path: path("flourish-" + width + ".png") });
  await p.clock.runFor(1500);
  await c.close();
  const wc = await b.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
  });
  await routes(wc);
  const wp = await wc.newPage();
  await wp.goto(base + "/?review=1");
  await wp.locator('.hero-courier[data-renderer="sprite"]').waitFor();
  await wp.evaluate(() => {
    const e = document.querySelector(".night-journey");
    scrollTo({
      top: e.offsetTop + (e.offsetHeight - innerHeight) * 0.3,
      behavior: "instant",
    });
  });
  await wp.waitForTimeout(400);
  await wp.locator(".journey-courier .sprite-viewport").waitFor();
  const actor = wp.locator(".journey-courier .traveller");
  const frames = new Set();
  let walked = false;
  for (let i = 0; i < 12; i++) {
    await wp.evaluate(() => scrollBy({ top: 15, behavior: "instant" }));
    await wp.waitForTimeout(45);
    frames.add(await actor.getAttribute("data-sprite-frame"));
    walked ||= (await actor.getAttribute("data-pose")) === "walking";
  }
  ok(walked && frames.size > 2, "walk follows scroll " + width);
  await actor.screenshot({ path: path("walk-" + width + ".png") });
  for (let i = 0; i < 6; i++) {
    await wp.evaluate(() => scrollBy({ top: -15, behavior: "instant" }));
    await wp.waitForTimeout(40);
  }
  ok(
    await actor
      .locator(".sprite-viewport")
      .evaluate((e) => e.style.scale === "-1 1"),
    "reverse facing " + width,
  );
  await actor.screenshot({ path: path("walk-reverse-" + width + ".png") });
  ok(
    (await wp.locator(".hero-courier").getAttribute("data-idle-active")) ===
      "false",
    "hero sleeps offscreen " + width,
  );
  await wp.getByRole("button", { name: "Pause motion" }).click();
  await wp.waitForTimeout(200);
  ok(
    (await actor.getAttribute("data-sprite-frame")) === "8",
    "pause still pose " + width,
  );
  ok(
    await wp.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "no width overflow " + width,
  );
  await wc.close();
  for (const kind of ["loading-answer", "agreement", "error"]) {
    const ctx = await b.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
    });
    await routes(ctx, kind);
    const pg = await ctx.newPage();
    await pg.goto(base + "/?review=1");
    await submit(pg);
    if (kind === "loading-answer")
      await pg.locator('.loading-courier[data-renderer="sprite"]').waitFor();
    else if (kind === "error") await pg.getByRole("alert").waitFor();
    else await pg.locator(".checked-claim").first().waitFor();
    const a =
      kind === "loading-answer"
        ? pg.locator(".loading-courier")
        : pg.locator(".screen-traveller").last();
    await a.locator(".sprite-viewport").waitFor();
    if (kind === "agreement") await pg.waitForTimeout(450);
    ok(
      (await a.getAttribute("data-pose")) ===
        (kind === "loading-answer"
          ? "thinking"
          : kind === "error"
            ? "puzzled"
            : "happy"),
      "real product pose " + kind + " " + width,
    );
    await a.screenshot({ path: path(kind + "-" + width + ".png") });
    await ctx.close();
  }
}
for (const variant of ["reduced", "missing", "invalid", "slow"]) {
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: variant === "reduced" ? "reduce" : "no-preference",
  });
  await routes(c);
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/mascot/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  if (variant !== "reduced")
    await c.route("**/mascot/manifest.json", async (r) => {
      if (variant === "slow")
        await new Promise((resolve) => setTimeout(resolve, 800));
      await r.fulfill(
        variant === "missing"
          ? { status: 404, body: "" }
          : {
              contentType: "application/json",
              body: JSON.stringify(
                variant === "invalid" ? { ...manifest, columns: 0 } : manifest,
              ),
            },
      );
    });
  const p = await c.newPage();
  await p.goto(base + "/?review=1");
  const h = p.locator(".hero-courier"),
    before = await h.boundingBox();
  if (["reduced", "slow"].includes(variant))
    await p.locator('.hero-courier[data-renderer="sprite"]').waitFor();
  else await p.waitForTimeout(300);
  const after = await h.boundingBox();
  ok(
    Math.abs(after.height - before.height) < 1 &&
      Math.abs(after.width - before.width) < 1,
    "reserved footprint " + variant,
  );
  ok(
    (await h.getAttribute("data-renderer")) ===
      (variant === "missing" || variant === "invalid" ? "builtin" : "sprite"),
    "asset fallback " + variant,
  );
  if (variant === "reduced") {
    const frame = await h.getAttribute("data-sprite-frame");
    await p.waitForTimeout(600);
    ok(
      (await h.getAttribute("data-sprite-frame")) === frame && frame === "8",
      "reduced still",
    );
    ok(
      await h
        .locator(".sprite-viewport")
        .evaluate((e) => getComputedStyle(e).animationName === "none"),
      "reduced CSS still",
    );
  }
  await h.screenshot({ path: path("asset-" + variant + ".png") });
  await c.close();
}
const image =
  "data:image/webp;base64," +
  (
    await readFile(new URL("../public/mascot/musashi.webp", import.meta.url))
  ).toString("base64");
const p = await b.newPage({ viewport: { width: 1600, height: 700 } });
await p.setContent(
  '<style>body{background:#f4f0e7;color:#26212b;font:22px Georgia;margin:30px}.row{display:grid;grid-template-columns:repeat(5,280px);gap:14px}.frame{width:264px;height:240px;overflow:hidden}.frame img{max-width:none;width:1056px;height:1200px}h1{font-size:40px}p{font:14px Arial}</style><h1>Samurai poses / supplied atlas</h1><p>Idle, look, think, gesture and the quiet sword-draw sequence. These are character frames, not answer evidence.</p><div class="row">' +
    [8, 9, 10, 11, 12, 13, 14, 15, 16, 19]
      .map(
        (n) =>
          '<div><div class="frame"><img src="' +
          image +
          '" style="transform:translate(' +
          -(n % 4) * 264 +
          "px," +
          -Math.floor(n / 4) * 240 +
          'px)"></div><p>Frame ' +
          n +
          "</p></div>",
      )
      .join("") +
    "</div>",
);
await p.screenshot({ path: path("pose-strip.png"), fullPage: true });
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(
  '<style>body{margin:0;background:#282137;color:#fff0cf;font-family:Georgia}.word{position:absolute;left:70px;top:110px;font-size:92px;line-height:1.05}.word em{color:#efb879}.sub{position:absolute;left:76px;top:410px;font:20px Arial}.moon{position:absolute;right:80px;top:55px;width:410px;height:410px;background:#be7756;border-radius:50%}.frame{position:absolute;right:110px;bottom:30px;width:440px;height:400px;overflow:hidden}.frame img{position:absolute;width:1760px;height:2000px;max-width:none;transform:translateY(-800px)}.seal{position:absolute;left:72px;top:55px;width:44px;height:44px}</style><div class="moon"></div><img class="seal" src="data:image/svg+xml;base64,' +
    (
      await readFile(new URL("../public/favicon.svg", import.meta.url))
    ).toString("base64") +
    '"><div class="word">For the love<br>of <em>anime.</em></div><div class="sub">Otaku Oracle / stories, sources & conversations.</div><div class="frame"><img src="' +
    image +
    '"></div>',
);
await p.screenshot({
  path: new URL("../public/og.png", import.meta.url).pathname.replace(
    /^\/([A-Za-z]:)/,
    "$1",
  ),
});
await b.close();
await writeFile(
  path("checks.json"),
  JSON.stringify({ checks, passed: true }, null, 2) + "\n",
);
console.log(checks + " companion assertions passed");
