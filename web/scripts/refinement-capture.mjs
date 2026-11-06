import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { routes } from "./fixtures.mjs";
const out = new URL(
  "../../docs/shots/saga/refinement/pass-1/",
  import.meta.url,
);
await mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });
for (const width of [390, 768, 1440]) {
  const c = await b.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    colorScheme: "light",
  });
  await routes(c);
  const p = await c.newPage();
  await p.goto("http://localhost:4178/?review=1");
  await p.evaluate(() => document.fonts.ready);
  await p
    .locator(".opening img")
    .evaluateAll(async (es) =>
      Promise.all(
        es.map((i) =>
          Promise.race([
            i.decode().catch(() => {}),
            new Promise((r) => setTimeout(r, 6000)),
          ]),
        ),
      ),
    );
  await p.screenshot({
    path: new URL("hero-" + width + ".png", out).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
  });
  if (width === 1440) {
    await p.evaluate(() => {
      const e = document.querySelector(".night-journey");
      scrollTo(0, e.offsetTop + (e.offsetHeight - innerHeight) * 0.25);
    });
    await p.locator(".journey-courier").waitFor();
    for (let i = 0; i < 10; i++) {
      await p.mouse.wheel(0, 4);
      await p.waitForTimeout(40);
    }
    await p
      .locator(".journey-courier .traveller")
      .screenshot({
        path: new URL("walking.png", out).pathname.replace(
          /^\/([A-Za-z]:)/,
          "$1",
        ),
      });
    console.log(
      await p
        .locator(".journey-courier .traveller")
        .evaluate((e) => ({
          pose: e.dataset.pose,
          phase: e.dataset.gaitPhase,
          legs: e.querySelectorAll(".leg-rig").length,
        })),
    );
  }
  await c.close();
}
await b.close();
console.log("Initial refinement captures ready");
