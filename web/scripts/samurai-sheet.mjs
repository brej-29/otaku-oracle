import { chromium } from "playwright";
import { readFile, mkdir } from "node:fs/promises";
import { routes, submit } from "./fixtures.mjs";
const root = new URL("../../docs/shots/saga/", import.meta.url),
  detail = new URL("details/", root);
await mkdir(detail, { recursive: true });
const path = (n, d = root) =>
  new URL(n, d).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const b = await chromium.launch({ channel: "msedge" });
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
  const c = await b.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await routes(c, kind);
  const p = await c.newPage();
  await p.goto("http://localhost:4178/?review=1");
  await submit(
    p,
    kind === "news"
      ? "Any news about the next season?"
      : kind === "discussion"
        ? "How do you interpret the ending?"
        : kind === "unclear"
          ? "Tell me something unexpected."
          : undefined,
  );
  await p.locator(".source-overview").waitFor();
  await p
    .locator(
      ["news", "discussion", "unclear"].includes(kind)
        ? ".conversation-shelf"
        : ".checked-claim",
    )
    .first()
    .screenshot({ path: path(kind + ".png", detail) });
  if (kind === "agreement")
    await p
      .locator(".source-overview")
      .screenshot({ path: path("sources.png", detail) });
  await c.close();
}
const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
const image = async (n) =>
  "data:image/png;base64," +
  (await readFile(new URL(n, root))).toString("base64");
const tile = async (n, label) =>
  '<figure><img src="' +
  (await image(n)) +
  '"><figcaption>' +
  label +
  "</figcaption></figure>";
const css =
  "<style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#f4f0e7;color:#26212b;font:17px Arial}h1{font:54px Georgia;margin:0 0 15px}h2{font:36px Georgia;margin:34px 0 18px}p{max-width:1200px;line-height:1.65}.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-bottom:32px}figure{margin:0;min-width:0}img{width:100%;height:360px;object-fit:contain;object-position:top;background:#ebe5da}figcaption{font-size:14px;line-height:1.5;margin-top:10px}.states img{height:440px}.wide img{height:auto}.poses img{height:600px}.hero img{height:470px}</style>";
let html =
  '<h1>Otaku Oracle / the wandering oracle</h1><p>Approved dusk cinema, supplied samurai atlas and a new source trail. All response examples below are labelled design fixtures, not factual results or live availability claims. Source-only smoke evidence is documented separately.</p><h2>The opening, at three widths</h2><div class="row hero">';
for (const [f, l] of [
  [
    "final/desktop-1440/idle.png",
    "1440 px / continuous world and real title deck",
  ],
  ["final/tablet-768/idle.png", "768 px / source note follows the front card"],
  ["final/phone-390/idle.png", "390 px / new seal, wordmark and wanderer"],
])
  html += await tile(f, l);
html += '</div><h2>The hero has a quiet life</h2><div class="row poses">';
for (const [f, l] of [
  ["samurai/look-1440.png", "Occasional glance / pointer-facing"],
  ["samurai/think-1440.png", "A quiet thought / active hero only"],
  ["samurai/flourish-1440.png", "Rare sword-draw / once per 26 active seconds"],
])
  html += await tile(f, l);
html +=
  '</div><div class="wide">' +
  (await tile(
    "samurai/pose-strip.png",
    "Supplied atlas: idle, look, think, open hand and sword flourish; no prior character art remains.",
  )) +
  '</div><h2>A trail of available sources</h2><div class="wide">' +
  (await tile(
    "details/sources.png",
    "Source availability is explicit and expandable. Fixture values are illustrative.",
  )) +
  '</div><h2>Agreement is earned; disagreement stays visible</h2><div class="row states">';
for (const [f, l] of [
  ["agreement", "Two sources agree / illustrative fixture"],
  [
    "source-conflict",
    "Each catalog keeps its own value / illustrative disagreement",
  ],
  ["source-unchecked", "One catalog is insufficient / unchecked"],
])
  html += await tile("details/" + f + ".png", l);
html += '</div><div class="row states">';
for (const [f, l] of [
  ["source-stale", "Stale evidence does not finish a verification"],
  ["single-source", "Catalog-owned metric is explicitly single-source"],
  ["unclear", "Unclear question / links rather than a default answer"],
])
  html += await tile("details/" + f + ".png", l);
html +=
  '</div><h2>A conversation is not a verification</h2><div class="row states">';
for (const [f, l] of [
  ["news", "Headline, source, date and replies / clearly illustrative"],
  ["discussion", "Community thread shelf / no factual stamp"],
  [
    "source-unchecked",
    "Original facts remain available while another source is down",
  ],
])
  html += await tile("details/" + f + ".png", l);
html +=
  '</div><h2>The travelling world and product states</h2><div class="row">';
for (const [f, l] of [
  [
    "final/desktop-1440/journey-middle.png",
    "Native horizontal/diagonal camera with the supplied wanderer",
  ],
  [
    "final/phone-390/loading-answer.png",
    "Thinking while a real pending request is represented by a fixture",
  ],
  ["final/phone-390/error.png", "Designed error / no substituted answer"],
])
  html += await tile(f, l);
html +=
  "</div><p>See docs/SAMURAI_SOURCES_REVIEW.md for measurements and limitations. Eight authored walk frames still have discrete contact changes. Secondary-source availability was not established by the local smoke. Hardware touch and screen readers remain untested.</p>";
await p.setContent(css + html);
await p.screenshot({ path: path("contact-sheet.png"), fullPage: true });
let strip =
  '<h1>Hero idle action / frame strip</h1><p>Actual hero captures at 1440 px: still, glance, thought, open-hand reaction and rare quiet flourish. The virtual clock advances only authored idle actions; answer progress remains tied to network events.</p><div class="row poses">';
for (const [n, l] of [
  ["idle-1440", "Idle opening"],
  ["look-1440", "Glance"],
  ["think-1440", "Thought"],
  ["gesture-1440", "Input focus / open hand"],
  ["flourish-1440", "Quiet draw"],
  ["walk-reverse-1440", "Reverse-scroll facing"],
])
  strip += await tile("samurai/" + n + ".png", l);
strip += "</div>";
await p.setContent(css + strip);
await p.screenshot({ path: path("hero-action-strip.png"), fullPage: true });
await b.close();
console.log("Current product contact sheet and hero strip ready");
