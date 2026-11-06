import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const out = new URL("../../docs/shots/journey/live/", import.meta.url);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const statuses = [],
  errors = [];
p.on("response", (r) => {
  if (r.url().includes("/api/ask")) statuses.push(r.status());
});
p.on("pageerror", (e) => errors.push(e.name));
await p.goto("http://localhost:5173");
await p.getByRole("combobox", { name: "Anime title" }).fill("Frieren");
await p.getByRole("option").first().waitFor({ timeout: 15000 });
await p.keyboard.press("ArrowDown");
await p.keyboard.press("Enter");
await p
  .getByRole("textbox", { name: "Your question" })
  .fill("Which studio animated it and how many episodes does it have?");
const start = performance.now();
await p.getByRole("button", { name: "Find the facts", exact: true }).click();
const outcome = await Promise.race([
  p
    .locator(".checked-claim")
    .first()
    .waitFor({ timeout: 22000 })
    .then(() => "checked"),
  p
    .locator(".error-page")
    .waitFor({ timeout: 22000 })
    .then(() => "error"),
  p
    .locator(".empty-claims")
    .waitFor({ timeout: 22000 })
    .then(() => "empty"),
]).catch(() => "timeout");
if (outcome !== "checked") {
  await p.screenshot({
    path: new URL("diagnostic.png", out).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
    fullPage: true,
  });
  console.log({
    outcome,
    http: statuses,
    errors,
    errorKind: await p
      .locator(".error-page")
      .getAttribute("class")
      .catch(() => null),
  });
  await browser.close();
  process.exit(1);
}
const elapsedMs = Math.round(performance.now() - start);
await p.evaluate(() => document.fonts.ready);
const verified = await p.locator(".claim-verified").count(),
  total = await p.locator(".checked-claim").count();
assert.ok(verified > 0);
assert.ok(
  await p
    .locator(".source-record")
    .innerText()
    .then((t) => t.includes("MADHOUSE")),
);
assert.deepEqual(statuses, [200]);
assert.deepEqual(errors, []);
for (const width of [390, 768, 1440]) {
  await p.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await p.screenshot({
    path: new URL(`answer-${width}.png`, out).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
    fullPage: true,
  });
}
const result = {
  at: new Date().toISOString(),
  scope:
    "One real API question through localhost:5173 and localhost:8787; no mocked requests",
  http: statuses,
  elapsedMs,
  verifiedClaims: verified,
  totalClaims: total,
  sourceMatched: true,
  runtimeErrors: errors,
};
await writeFile(new URL("status.json", out), JSON.stringify(result, null, 2));
console.log(result);
await browser.close();
