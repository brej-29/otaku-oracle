import { chromium } from "playwright";
import { routes } from "./fixtures.mjs";
const b = await chromium.launch({ channel: "msedge" });
for (const [folder, width] of Object.entries({
  "phone-390": 390,
  "tablet-768": 768,
  "desktop-1440": 1440,
})) {
  for (const [name, options] of [
    ["idle", { colorScheme: "light" }],
    ["idle-dark", { colorScheme: "dark", reducedMotion: "reduce" }],
    ["idle-reduced", { colorScheme: "light", reducedMotion: "reduce" }],
  ]) {
    const c = await b.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      ...options,
    });
    await routes(c);
    const p = await c.newPage();
    await p.goto("http://localhost:4178/?review=1");
    await p.evaluate(() => document.fonts.ready);
    await p.locator(".opening img").evaluateAll(async (es) => {
      await Promise.all(es.map((i) => i.decode().catch(() => {})));
    });
    const failed = await p
      .locator(".opening img")
      .evaluateAll((es) => es.filter((i) => !i.naturalWidth).map((i) => i.alt));
    if (failed.length) throw Error("Unavailable art: " + failed.join(", "));
    await p.screenshot({
      path: "../docs/shots/saga/final/" + folder + "/" + name + ".png",
    });
    console.log(folder + " " + name + ": all three covers decoded");
    await c.close();
  }
}
await b.close();
