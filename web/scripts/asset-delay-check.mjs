import { chromium } from "playwright";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { routes } from "./fixtures.mjs";
const base = process.env.BASE_URL ?? "http://localhost:4178",
  manifest = JSON.parse(
    await readFile(
      new URL("../public/mascot/manifest.json", import.meta.url),
      "utf8",
    ),
  );
const browser = await chromium.launch({ channel: "msedge" }),
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await routes(context);
await context.route("**/mascot/" + manifest.image, async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await route.continue();
});
const page = await context.newPage();
await page.goto(base + "/?review=1");
const root = page.locator(".hero-courier"),
  before = await root.boundingBox();
assert.equal(await root.getAttribute("data-renderer"), "builtin");
await page.getByRole("combobox").fill("Frieren");
await page.getByRole("option").first().waitFor();
assert.equal(await page.getByRole("combobox").inputValue(), "Frieren");
await page
  .locator('.hero-courier[data-renderer="sprite"]')
  .waitFor({ timeout: 10000 });
const after = await root.boundingBox();
assert.equal(before.width, after.width);
assert.equal(before.height, after.height);
await page.evaluate(() => scrollTo(0, 0));
const out = new URL("../../docs/shots/saga/samurai/", import.meta.url);
await page.screenshot({
  path: new URL("asset-slow-image.png", out).pathname.replace(
    /^\/([A-Za-z]:)/,
    "$1",
  ),
});
await writeFile(
  new URL("slow-image-check.json", out),
  JSON.stringify(
    {
      passed: true,
      delayMs: 5000,
      initial: "neutral silhouette",
      final: "sprite",
      formUsableDuringLoad: true,
      layoutShiftInMascot: false,
    },
    null,
    2,
  ) + "\n",
);
await browser.close();
console.log(
  "Slow atlas: form usable; silhouette replaced without shifting dimensions",
);
