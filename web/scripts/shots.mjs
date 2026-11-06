import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { routes, submit } from "./fixtures.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4178";
const PASS = process.env.SHOT_PASS ?? "final";
const root = new URL(`../../docs/shots/journey/${PASS}/`, import.meta.url);
const browser = await chromium.launch({ channel: "msedge" });
const manifest = [];
const widths = { "phone-390": 390, "tablet-768": 768, "desktop-1440": 1440 };
for (const [folder, width] of Object.entries(widths)) {
  const dir = new URL(`${folder}/`, root);
  await mkdir(dir, { recursive: true });
  for (const kind of [
    "idle",
    "loading-record",
    "loading-answer",
    "verified",
    "conflict",
    "unchecked",
    "three-states",
    "record-only",
    "error",
    "offline",
    "rate",
    "why",
    "how",
    "why-sample",
  ]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      colorScheme: "light",
    });
    await routes(ctx, kind);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.name));
    await page.goto(
      `${BASE}/?review=1${kind === "why" || kind === "how" || kind === "why-sample" ? `&page=${kind === "why-sample" ? "why&sample" : kind}` : ""}`,
    );
    await page.evaluate(() => document.fonts.ready);
    if (!["idle", "why", "how", "why-sample"].includes(kind)) {
      await submit(page);
      if (kind.startsWith("loading")) await page.locator(".waiting").waitFor();
      else if (["error", "offline", "rate"].includes(kind))
        await page.getByRole("alert").waitFor();
      else await page.locator(".checked-claim").first().waitFor();
    }
    if (kind === "loading-answer")
      await page
        .getByText("Waiting for a drafted and checked answer.", {
          exact: false,
        })
        .waitFor();
    await page.waitForTimeout(kind.startsWith("loading") ? 150 : 700);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    await page.screenshot({
      path: new URL(`${kind}.png`, dir).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
      fullPage: !["idle", "loading-record", "loading-answer"].includes(kind),
    });
    manifest.push({
      folder,
      kind,
      overflow,
      errors,
      fixture: kind !== "why" && kind !== "how",
    });
    if (kind === "idle" && width >= 768) {
      for (const [stage, p] of [
        ["journey-middle", 0.5],
        ["journey-source", 1],
      ]) {
        await page.evaluate((p) => {
          const el = document.querySelector(".journey");
          window.scrollTo(
            0,
            el.offsetTop + (el.offsetHeight - innerHeight) * p,
          );
        }, p);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: new URL(`${stage}.png`, dir).pathname.replace(
            /^\/([A-Za-z]:)/,
            "$1",
          ),
        });
      }
    }
    await ctx.close();
  }
  for (const [variant, options] of [
    ["reduced", { reducedMotion: "reduce", colorScheme: "light" }],
    ["dark", { reducedMotion: "reduce", colorScheme: "dark" }],
  ]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      ...options,
    });
    await routes(ctx);
    const p = await ctx.newPage();
    await p.goto(BASE);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: new URL(`idle-${variant}.png`, dir).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
    });
    if (variant === "dark") {
      await submit(p);
      await p.locator(".checked-claim").first().waitFor();
      await p.locator(".source-record").scrollIntoViewIfNeeded();
      await p
        .waitForFunction(
          () => [...document.images].every((i) => i.complete),
          null,
          { timeout: 6000 },
        )
        .catch(() => {});
      await p.evaluate(() => scrollTo(0, 0));
      await p.screenshot({
        path: new URL("answer-dark.png", dir).pathname.replace(
          /^\/([A-Za-z]:)/,
          "$1",
        ),
        fullPage: true,
      });
    }
    await ctx.close();
  }
}
await browser.close();
await writeFile(
  new URL("manifest.json", root),
  JSON.stringify(manifest, null, 2),
);
const failed = manifest.filter((m) => m.overflow || m.errors.length);
console.log(
  `${manifest.length} states captured; ${failed.length} overflow/runtime failures`,
);
if (failed.length) {
  console.log(failed);
  process.exitCode = 1;
}
