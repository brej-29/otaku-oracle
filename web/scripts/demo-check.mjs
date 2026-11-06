import { chromium } from "playwright";
import assert from "node:assert/strict";
import { routes } from "./fixtures.mjs";
const b = await chromium.launch({ channel: "msedge" });
const c = await b.newContext();
await routes(c);
const p = await c.newPage();
await p.goto(process.env.BASE_URL ?? "http://localhost:5173");
const results = await p.evaluate(async () => {
  const api = await import("/src/api.ts");
  if (api.API_BASE) throw new Error("This check requires demo mode");
  const one = await api.ask(154587, "Which studio animated it?");
  const two = await api.ask(
    154587,
    "Which studio animated it and how many episodes does it have?",
  );
  const characters = await api.ask(
    154587,
    "How many main characters are there?",
  );
  let abstained = false;
  try {
    await api.ask(154587, "Why is the moon blue?");
  } catch (e) {
    abstained = e.kind === "empty" && e.message.includes("record-only demo");
  }
  return {
    one: one.claims.map((c) => c.field),
    two: two.claims.map((c) => c.field),
    characters: characters.claims.map((c) => c.field),
    abstained,
    demo: one.demo,
  };
});
assert.deepEqual(results.one, ["studio"]);
assert.deepEqual(results.two, ["studio", "episodes"]);
assert.deepEqual(results.characters, ["main_characters"]);
assert.equal(results.abstained, true);
assert.equal(results.demo, true);
await p.getByRole("combobox", { name: "Anime title" }).fill("Frieren");
await p.getByRole("option").first().waitFor();
await p.keyboard.press("ArrowDown");
await p.keyboard.press("Enter");
await p
  .getByRole("textbox", { name: "Your question" })
  .fill("Why is the moon blue?");
await p.getByRole("button", { name: "Find the facts", exact: true }).click();
await p.getByRole("alert").waitFor();
const { mkdir } = await import("node:fs/promises");
const out = new URL("../../docs/shots/journey/demo/", import.meta.url);
await mkdir(out, { recursive: true });
for (const width of [390, 768, 1440]) {
  await p.setViewportSize({ width, height: width === 390 ? 844 : 900 });
  await p.screenshot({
    path: new URL(`unmatched-${width}.png`, out).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
    fullPage: true,
  });
}
await b.close();
console.log("5 demo truth checks passed");
