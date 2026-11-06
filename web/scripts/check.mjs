import { chromium } from "playwright";
import assert from "node:assert/strict";
import { routes, submit } from "./fixtures.mjs";
const base = process.env.BASE_URL ?? "http://localhost:4178",
  browser = await chromium.launch({ channel: "msedge" });
let checks = 0;
const ok = (value, label) => {
  assert.ok(value, label);
  checks++;
};
for (const kind of [
  "verified",
  "conflict",
  "unchecked",
  "record-only",
  "error",
  "rate",
  "offline",
]) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await routes(ctx, kind);
  const p = await ctx.newPage();
  await p.goto(base);
  await submit(p);
  if (["error", "rate", "offline"].includes(kind)) {
    await p.getByRole("alert").waitFor();
    ok(
      (await p.locator(".checked-claim").count()) === 0,
      `${kind} must not substitute claims`,
    );
  } else {
    await p.locator(".checked-claim").first().waitFor();
    ok(
      (await p
        .locator(`.claim-${kind === "record-only" ? "verified" : kind}`)
        .count()) > 0,
      kind,
    );
    if(kind==="verified"){
      const actor=await p.locator(".screen-traveller").boundingBox();
      const heading=await p.locator(".question-heading h1").boundingBox();
      ok(actor.y+actor.height < heading.y,"companion clears the mobile question");
    }
    if (kind === "conflict")
      ok(
        await p
          .locator(".correction")
          .innerText()
          .then((t) => t.includes("28")),
        "visible correction",
      );
    if (kind === "record-only")
      ok(
        await p
          .locator(".answer-context")
          .innerText()
          .then((t) => t.toLowerCase().includes("record-only fallback")),
        "honest fallback",
      );
  }
  ok(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "phone width",
  );
  await ctx.close();
}
const ctx = await browser.newContext();
await routes(ctx);
const p = await ctx.newPage();
await p.goto(base);
for (let i = 0; i < 25; i++) {
  if (await p.evaluate(() => document.activeElement?.id === "anime-title"))
    break;
  await p.keyboard.press("Tab");
}
ok(
  await p.evaluate(() => document.activeElement?.id === "anime-title"),
  "keyboard reaches search",
);
await p.keyboard.type("Frieren");
await p.getByRole("option").first().waitFor();
await p.keyboard.press("ArrowDown");
await p.keyboard.press("Enter");
await p.keyboard.press("Tab");
ok(
  await p.evaluate(() => document.activeElement?.id === "question"),
  "keyboard reaches question",
);
await p.keyboard.type("Which studio animated it?");
await p.keyboard.press("Tab");
await p.keyboard.press("Tab");
await p.keyboard.press("Enter");
await p.locator(".checked-claim").first().waitFor();
ok((await p.locator(".claim-verified").count()) === 2, "keyboard submit");
await p.getByRole("button", { name: "Pause motion" }).click();
ok(
  await p.evaluate(() => document.documentElement.dataset.motion === "off"),
  "pause control",
);
await ctx.close();
const reduced = await browser.newContext({ reducedMotion: "reduce" });
await routes(reduced);
const rp = await reduced.newPage();
await rp.goto(base);
ok(
  await rp.evaluate(() => document.documentElement.dataset.motion === "off"),
  "reduced motion",
);
ok(
  await rp
    .locator(".traveller-body")
    .first()
    .evaluate((e) => getComputedStyle(e).animationName === "none"),
  "still traveller",
);
ok(
  (await rp.locator(".travel-scene").count()) === 3,
  "complete static journey on initial reduced-motion load",
);
await reduced.close();
for (const status of ["PENDING", "PARTIAL", "COMPLETE"]) {
  const c = await browser.newContext({ viewport: { width: 768, height: 900 } });
  await routes(c);
  await c.route("**/data/eval-summary.json", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        status,
        sample: true,
        updated_at: null,
        note: "Test-only illustrative measurements, not results.",
        models:
          status === "PENDING"
            ? []
            : [
                {
                  id: "fixture",
                  label: "Illustrative run",
                  provider: "fixture",
                  primary: true,
                  arms: {
                    A: {
                      accuracy: 0.41,
                      lo: 0.31,
                      hi: 0.51,
                      responses: 41,
                      expected: 100,
                    },
                    B: {
                      accuracy: 0.73,
                      lo: 0.63,
                      hi: 0.83,
                      responses: 73,
                      expected: 100,
                    },
                  },
                },
              ],
      }),
    }),
  );
  const pg = await c.newPage();
  await pg.goto(base + "/?page=why");
  await pg.getByText("Illustrative sample", { exact: false }).waitFor();
  ok(
    (await pg.locator(".measurement-sheet .status-label").innerText()) ===
      status,
    "runtime status " + status,
  );
  ok(
    await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "tablet measurement width",
  );
  await c.close();
}
const offline = await browser.newContext();
await routes(offline);
const op = await offline.newPage();
await op.goto(base);
await offline.setOffline(true);
await op.locator(".connection-banner").waitFor();
ok(
  (await op.locator(".checked-claim").count()) === 0,
  "offline never invents claims",
);
await offline.close();
const travel = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await routes(travel);
const tp = await travel.newPage();
await tp.goto(base);
await tp.mouse.wheel(0, 200);
await tp.waitForTimeout(60);
ok(
  (await tp.locator(".screen-traveller").getAttribute("data-pose")) ===
    "walking",
  "guide walks on scroll",
);
ok(
  await tp
    .locator(".frame-0")
    .first()
    .evaluate((e) => getComputedStyle(e).animationName.includes("walk-frame")),
  "walking legs animate",
);
await tp.getByRole("button", { name: "Pause motion" }).click();
ok(
  await tp
    .locator(".traveller-body")
    .first()
    .evaluate((e) => getComputedStyle(e).animationName === "none"),
  "pause stops guide",
);
await travel.close();
const pending = await browser.newContext();
await routes(pending, "loading-answer");
const pp = await pending.newPage();
await pp.goto(base);
await submit(pp);
await pp
  .getByText("Waiting for a drafted and checked answer.", { exact: false })
  .waitFor();
ok(
  (await pp.locator(".loading-courier").getAttribute("data-pose")) ===
    "thinking",
  "thinking pose while pending",
);
ok(
  (await pp
    .locator(".honest-progress li")
    .nth(2)
    .getAttribute("data-status")) === "pending",
  "no invented verification progress",
);
await pp.getByRole("button", { name: "Stop waiting" }).click();
await pp.getByRole("combobox").waitFor();
ok(
  (
    await pp.getByRole("textbox", { name: "Your question" }).inputValue()
  ).includes("Which studio"),
  "cancel preserves question",
);
await pending.close();
await browser.close();
console.log(`${checks} browser checks passed`);
