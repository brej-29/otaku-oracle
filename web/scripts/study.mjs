import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const dir = new URL("../../docs/shots/journey/references/", import.meta.url);
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const notes = [];
for (const [name, url] of [
  ["crossing", "https://www.liquidink.design/github_web/"],
  ["saga", "https://dearfuture-samuraisaga.webflow.io/"],
  ["mecha", "https://themekaverse-ijbd.webflow.io/"],
]) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(4000);
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    const row = { name, url, title: await page.title(), height, stages: [] };
    for (const [stage, ratio] of [
      ["start", 0],
      ["middle", 0.45],
      ["end", 0.85],
    ]) {
      await page.evaluate(
        (r) =>
          window.scrollTo(
            0,
            (document.documentElement.scrollHeight - innerHeight) * r,
          ),
        ratio,
      );
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: new URL(`${name}-${stage}.png`, dir).pathname.replace(
          /^\/([A-Za-z]:)/,
          "$1",
        ),
      });
      row.stages.push({
        stage,
        scroll: await page.evaluate(() => scrollY),
        transforms: await page.locator("body *").evaluateAll((es) =>
          es
            .filter((e) => getComputedStyle(e).transform !== "none")
            .slice(0, 12)
            .map((e) => ({
              tag: e.tagName,
              transform: getComputedStyle(e).transform,
            })),
        ),
      });
    }
    notes.push(row);
  } catch {
    notes.push({ name, url, status: "unavailable" });
  }
  await page.close();
}
await writeFile(new URL("study.json", dir), JSON.stringify(notes, null, 2));
await browser.close();
console.log(
  notes.map((n) => ({
    name: n.name,
    title: n.title,
    height: n.height,
    status: n.status ?? "opened",
  })),
);
