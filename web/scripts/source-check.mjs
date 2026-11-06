import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { routes, submit, fixture } from "./fixtures.mjs";
const b = await chromium.launch({ channel: "msedge" });
let checks = 0;
const ok = (v, m) => {
  assert.ok(v, m);
  checks++;
};
for (const w of [390, 768, 1440])
  for (const kind of [
    "agreement",
    "source-conflict",
    "source-unchecked",
    "source-stale",
    "single-source",
    "news",
    "discussion",
    "unclear",
  ]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 } });
    await routes(c, kind);
    const p = await c.newPage();
    await p.goto("http://localhost:4178/?review=1");
    await submit(p);
    await p.locator(".source-overview").waitFor();
    ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "width " + w + " " + kind,
    );
    ok(
      (await p.locator(".source-presence-item").count()) === 4,
      "all source states",
    );
    if (kind === "agreement") {
      const summary = p.locator(".source-presence-item summary").first();
      await summary.focus();
      await p.keyboard.press("Enter");
      ok(
        await p
          .locator(".source-presence-item")
          .first()
          .evaluate((e) => e.open),
        "keyboard opens source details",
      );
      ok(
        await summary.evaluate(
          (e) => parseFloat(getComputedStyle(e).outlineWidth) >= 2,
        ),
        "source focus visible",
      );
    }
    if (["news", "discussion", "unclear"].includes(kind)) {
      ok(
        (await p.locator(".checked-claim").count()) === 0,
        "discussion has no fact stamps",
      );
      ok(
        (await p.locator(".conversation-heading").innerText()).includes(
          "Discussion, not verified",
        ),
        "discussion label",
      );
      ok((await p.locator(".claim-burst").count()) === 0, "no verified burst");
    } else if (kind === "source-conflict") {
      ok(
        await p
          .locator(".evidence-dispute strong")
          .allTextContents()
          .then((x) => x.join("|") === "28|29"),
        "both disagreement values",
      );
    } else if (kind === "source-stale" || kind === "source-unchecked") {
      ok(
        (await p.locator(".claim-unchecked").count()) === 1,
        "insufficient evidence remains unchecked",
      );
    } else {
      ok(
        (await p.locator(".claim-verified").count()) === 1,
        "corroborated or explicit single-source",
      );
      if (kind === "single-source")
        ok(
          (await p.locator(".claim-label").innerText())
            .toLowerCase()
            .includes("single source"),
          "single source identified",
        );
    }
    await c.close();
  }
const c = await b.newContext({ viewport: { width: 390, height: 844 } });
await routes(c);
await c.route("**/api/ask", (r) => {
  const body = fixture("verified");
  body.claims = body.claims.map(({ verification: _v, ...claim }) => claim);
  return r.fulfill({
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify(body),
  });
});
const p = await c.newPage();
await p.goto("http://localhost:4178");
await submit(p);
await p.locator(".checked-claim").first().waitFor();
ok(
  (await p.locator(".claim-verified").count()) === 0,
  "legacy single-record answers never look independently verified",
);
ok(
  (await p.locator(".claim-label").first().innerText())
    .toLowerCase()
    .includes("record match"),
  "legacy semantic label",
);
await c.close();
await b.close();
await writeFile(
  new URL("../../docs/shots/saga/source-checks.json", import.meta.url),
  JSON.stringify({ checks, passed: true }, null, 2) + "\n",
);
console.log(checks + " source UI assertions passed");
