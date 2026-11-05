// End-to-end against a running Worker: node scripts/e2e-live.mjs [baseUrl] ; BASE defaults to the dev server on :5173 (the Worker's allowed origin).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5173";
const out = new URL("../../docs/shots/claude/live/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const calls = [];
page.on("response", (r) => { if (r.url().includes("/api/ask")) calls.push(r.status()); });

await page.goto(BASE);
await page.getByRole("combobox", { name: "Anime title" }).fill("Frieren");
await page.getByRole("option").first().waitFor({ timeout: 20000 });
await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
await page.getByLabel("Your question").fill("Which studio animated it and how many episodes does it have?");
await page.getByRole("button", { name: "Check it" }).click();
await page.locator(".proof").waitFor({ timeout: 60000 });
await page.waitForTimeout(4500);
await page.screenshot({ path: `${out}answer-live.png` });
const claims = await page.locator(".proof__line").evaluateAll((els) => els.map((e) => ({ cls: e.className, text: e.innerText.replace(/\s+/g, " ").slice(0, 140) })));
const notice = await page.locator(".proof__head .tag").allInnerTexts();
console.log(JSON.stringify({ askStatus: calls, notice, claims }, null, 1));
await browser.close();
