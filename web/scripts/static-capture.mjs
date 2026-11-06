import { chromium } from "playwright";
import { routes } from "./fixtures.mjs";
const b = await chromium.launch({ channel: "msedge" });
try {
  for (const [folder, width] of Object.entries({
    "phone-390": 390,
    "tablet-768": 768,
    "desktop-1440": 1440,
  })) {
    const c = await b.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    await routes(c);
    const p = await c.newPage();
    await p.goto("http://localhost:4178/?review=1");
    await p.evaluate(() => document.fonts.ready);
    for (const [i, name] of [
      "journey-still",
      "journey-still-details",
      "journey-still-next",
    ].entries()) {
      const scene = p.locator(".travel-scene").nth(i);
      await scene.waitFor();
      await scene.evaluate((e) => e.scrollIntoView({ block: "start" }));
      await scene.locator("img").evaluateAll(async (es) => {
        await Promise.all(
          es
            .filter((i) => i.getBoundingClientRect().width > 0)
            .map((i) => {
              i.loading = "eager";
              return Promise.race([
                i.decode().catch(() => {}),
                new Promise((r) => setTimeout(r, 8000)),
              ]);
            }),
        );
      });
      await scene.screenshot({
        path: new URL(
          "../../docs/shots/saga/final/" + folder + "/" + name + ".png",
          import.meta.url,
        ).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
      });
    }
    await c.close();
    console.log(folder + ": three static scenes captured");
  }
} finally {
  await b.close();
}
