import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { routes } from "./fixtures.mjs";
const pass = process.env.PASS ?? "pass-1",
  root = new URL("../../docs/shots/saga/" + pass + "/", import.meta.url);
await mkdir(root, { recursive: true });
const b = await chromium.launch({ channel: "msedge" }),
  manifest = [];
for (const width of [390, 768, 1440]) {
  const c = await b.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    colorScheme: "light",
  });
  await routes(c);
  const p = await c.newPage(),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.name));
  await p.goto("http://localhost:5173/?review=1");
  await p.evaluate(() => document.fonts.ready);
  await p
    .waitForFunction(
      () =>
        [...document.querySelectorAll(".opening img")].every((i) => i.complete),
      null,
      { timeout: 10000 },
    )
    .catch(() => {});
  await p.screenshot({
    path: new URL("hero-" + width + ".png", root).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
  });
  await p.locator(".question-desk").screenshot({
    path: new URL("desk-" + width + ".png", root).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
  });
  for (const [name, f] of [
    ["worlds", 0],
    ["details", 0.5],
    ["next", 1],
  ]) {
    await p.evaluate((f) => {
      const e = document.querySelector(".night-journey");
      scrollTo(
        0,
        e.getBoundingClientRect().top +
          scrollY +
          (e.offsetHeight - innerHeight) * f,
      );
    }, f);
    await p.locator(".scene-track").waitFor();
    await p.waitForTimeout(600);
    await p.screenshot({
      path: new URL(name + "-" + width + ".png", root).pathname.replace(
        /^\/([A-Za-z]:)/,
        "$1",
      ),
    });
  }
  manifest.push({
    width,
    overflow: await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    errors,
  });
  await c.close();
}
const c = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 4,
  colorScheme: "light",
});
await routes(c);
const p = await c.newPage();
await p.goto("http://localhost:5173/?review=1");
await p.locator(".hero-courier").screenshot({
  path: new URL("courier-4x.png", root).pathname.replace(
    /^\/([A-Za-z]:)/,
    "$1",
  ),
});
await c.close();
await writeFile(
  new URL("manifest.json", root),
  JSON.stringify(manifest, null, 2),
);
await b.close();
console.log(manifest);
