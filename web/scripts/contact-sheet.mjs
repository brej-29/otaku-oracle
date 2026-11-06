import { chromium } from "playwright";
import { readFile } from "node:fs/promises";
const root = new URL("../../docs/shots/saga/", import.meta.url);
const image = async (name) =>
  "data:image/png;base64," +
  (await readFile(new URL(name, root))).toString("base64");
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({
  viewport: { width: 1800, height: 1100 },
  deviceScaleFactor: 1,
});
const face = (
  await readFile(
    new URL(
      "../public/fonts/instrument-serif-latin-400-normal.woff2",
      import.meta.url,
    ),
  )
).toString("base64");
const css =
  "<style>@font-face{font-family:Display;src:url(data:font/woff2;base64," +
  face +
  ")}*{box-sizing:border-box}body{margin:0;padding:44px;background:#f4f0e7;color:#26212b;font-family:Arial,sans-serif}h1{font:60px Display;margin:0 0 14px}h2{font:36px Display;margin:0 0 18px}p{font-size:15px;line-height:1.6;margin:0 0 24px;color:#655b66}.row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}.tile{margin:0;min-width:0}.tile img{display:block;width:100%;height:330px;object-fit:cover;object-position:top;border:1px solid #d2c6c7}.tile figcaption{font-size:13px;margin-top:10px;line-height:1.5}.hero{display:grid;grid-template-columns:1.65fr .65fr .9fr;gap:22px;margin-bottom:44px}.hero img{height:640px;width:100%;object-fit:contain;object-position:top;background:#ede7dc}.strip img{height:auto}.phone-scenes img{height:700px;object-fit:contain;background:#ede7dc}.small{font-size:12px;color:#655b66}hr{border:0;border-top:1px solid #d2c6c7;margin:35px 0}</style>";
const tile = async (src, label, cls = "") =>
  '<figure class="tile ' +
  cls +
  '"><img src="' +
  (await image(src)) +
  '"/><figcaption>' +
  label +
  "</figcaption></figure>";
let body =
  "<h1>Otaku Oracle / dusk cinema</h1><p>Final visual review. Real title artwork via AniList. Reference studies are shown for comparison, not production assets. Response-state frames are visibly labelled fixtures.</p><h2>The references</h2><div class='row'>";
for (const [f, l] of [
  [
    "references/crossing-wheel-2.png",
    "Liquid Ink: depth and a continuous camera",
  ],
  ["references/saga-middle.png", "Samurai Saga: dramatic value and scale"],
  ["references/mecha-middle.png", "MekaVerse: bold framed composition"],
])
  body += await tile(f, l);
body += "</div><h2>The anime-first opening</h2><div class='hero'>";
for (const [f, l] of [
  [
    "final/desktop-1440/idle.png",
    "1440 px / working question desk and real cover stack",
  ],
  ["final/phone-390/idle.png", "390 px / full-sized original companion"],
  ["final/tablet-768/idle.png", "768 px / the same world at tablet scale"],
])
  body += await tile(f, l);
body += "</div><h2>The travelling world</h2><div class='row'>";
for (const [f, l] of [
  [
    "final/desktop-1440/journey-worlds.png",
    "The worlds / suspended anime posters",
  ],
  ["final/desktop-1440/journey-middle.png", "The details / source and story"],
  [
    "final/desktop-1440/journey-source.png",
    "The next story / return to a question",
  ],
])
  body += await tile(f, l);
body += "</div><div class='row phone-scenes'>";
for (const [f, l] of [
  ["final/phone-390/journey-worlds.png", "390 px / worlds"],
  ["final/phone-390/journey-middle.png", "390 px / details"],
  ["final/phone-390/journey-source.png", "390 px / next story"],
])
  body += await tile(f, l);
body += "</div><h2>From camera travel to a quiet answer</h2><div class='row'>";
for (const [f, l] of [
  [
    "final/desktop-1440/loading-answer.png",
    "Loading / real pending request, illustrative response fixture",
  ],
  [
    "final/desktop-1440/three-states.png",
    "Verified / conflict / unchecked, illustrative fixture",
  ],
  [
    "final/desktop-1440/journey-still.png",
    "Reduced motion / first of three separately captured still scenes",
  ],
])
  body += await tile(f, l);
body +=
  "</div><p class='small'>See motion/ for nine consecutive scroll frames and the idle before/after comparison; see live/ for the separate real local answer. This sheet does not establish accuracy or production availability.</p>";
await p.setContent(css + body);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({
  path: new URL("contact-sheet.png", root).pathname.replace(
    /^\/([A-Za-z]:)/,
    "$1",
  ),
  fullPage: true,
});
let strip =
  "<h1>The camera, in nine frames</h1><p>Consecutive native document-scroll positions, captured 500 ms after each movement. The moving sky, scenery and foreground travel at different rates.</p><div class='row strip'>";
for (let i = 0; i < 9; i++)
  strip += await tile(
    "motion/scroll-" + i + ".png",
    "Scroll position " + i + " / 8",
  );
strip += "</div><h2>Alive before the scroll</h2><div class='row'>";
strip += await tile("motion/idle-a.png", "Idle, first frame");
strip += await tile("motion/idle-b.png", "Idle, 1.2 seconds later");
strip += "</div>";
await p.setContent(css + strip);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({
  path: new URL("scroll-strip.png", root).pathname.replace(
    /^\/([A-Za-z]:)/,
    "$1",
  ),
  fullPage: true,
});
await b.close();
console.log("Contact sheet and scroll strip captured");
