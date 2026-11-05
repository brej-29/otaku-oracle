// Usage: npm run build && npx vite preview --port 4173 & node scripts/shots.mjs
// Writes docs/shots/proof-sheet/<viewport>/<screen>.png. Answer shots use the live AniList API.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/shots/proof-sheet");
const VIEWPORTS = { "phone-390": { width: 390, height: 844 }, "tablet-768": { width: 768, height: 1024 }, "desktop-1440": { width: 1440, height: 900 } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(page, title, q) {
  await page.getByRole("combobox", { name: "Anime title" }).fill(title);
  await page.getByRole("option").first().waitFor({ timeout: 15000 });
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByLabel("Your question").fill(q);
  await page.getByRole("button", { name: "Check it" }).click();
}

const browser = await chromium.launch();
for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  await wait(30000);
  const dir = path.join(OUT, name);
  mkdirSync(dir, { recursive: true });
  const shot = (page, n, full = false) => page.screenshot({ path: path.join(dir, `${n}.png`), fullPage: full });

  // light, default motion
  let ctx = await browser.newContext({ viewport, colorScheme: "light", deviceScaleFactor: 1 });
  let page = await ctx.newPage();
  await page.goto(BASE); await page.evaluate(() => document.fonts.ready); await wait(2200);
  await shot(page, "01-home"); await shot(page, "01-home-full", true);

  await ask(page, "Frieren", "Which studio animated it?");
  await wait(700); await shot(page, "02-answer-stamping");
  await wait(3200); await shot(page, "03-answer-done");
  await page.goto(`${BASE}/?states`); await ask(page, "Cowboy Bebop", "How many episodes?"); await wait(4200); await shot(page, "03b-answer-three-states");
  await page.locator("#why").scrollIntoViewIfNeeded(); await wait(600); await shot(page, "04-why-pending");
  await page.locator("#how").scrollIntoViewIfNeeded(); await wait(600); await shot(page, "05-how");
  await page.goto(`${BASE}/?sample`); await page.locator("#why").scrollIntoViewIfNeeded(); await wait(1500); await shot(page, "06-why-sample-chart");

  // states
  await page.goto(BASE);
  await page.route("https://graphql.anilist.co/**", async (route) => {
    const body = route.request().postData() ?? "";
    if (route.request().method() === "OPTIONS" || body.includes("Page(")) return route.continue();
    await wait(6000); return route.continue().catch(() => {});
  });
  await ask(page, "Cowboy Bebop", "How many episodes?");
  await wait(5000); await shot(page, "07-loading-slow");
  await page.unroute("https://graphql.anilist.co/**");

  await page.route("https://graphql.anilist.co/**", (route) => {
    const body = route.request().postData() ?? "";
    if (route.request().method() === "OPTIONS" || body.includes("Page(")) return route.continue();
    return route.fulfill({ status: 429, body: "{}", headers: { "access-control-allow-origin": "*" } });
  });
  await page.goto(BASE); await ask(page, "Spirited Away", "When did it come out?");
  await page.getByRole("alert").first().waitFor(); await wait(400); await shot(page, "08-error-rate-limited");
  await page.unroute("https://graphql.anilist.co/**");

  await page.goto(BASE); await ctx.setOffline(true); await page.evaluate(() => dispatchEvent(new Event("offline")));
  await wait(400); await shot(page, "09-offline"); await ctx.setOffline(false);

  await page.goto(BASE); await page.getByRole("combobox", { name: "Anime title" }).fill("zzzxqzzq"); await wait(1500); await shot(page, "10-no-match");
  await ctx.close();

  // dark theme and reduced motion (pause so AniList's 30 requests/minute limit resets)
  await wait(45000);
  ctx = await browser.newContext({ viewport, colorScheme: "dark", reducedMotion: "reduce" });
  page = await ctx.newPage();
  await page.goto(BASE); await page.evaluate(() => document.fonts.ready); await wait(300); await shot(page, "11-home-dark-reduced");
  await ask(page, "Frieren", "Which studio animated it?"); await wait(900); await shot(page, "12-answer-dark-reduced");
  await ctx.close();
}
await browser.close();
console.log("shots written to", OUT);
