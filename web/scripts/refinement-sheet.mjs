import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { routes } from "./fixtures.mjs";
const root = new URL("../../docs/shots/saga/", import.meta.url),
  out = new URL("refinement/", root);
const path = (n) => new URL(n, out).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const b = await chromium.launch({ channel: "msedge" });
for (const width of [390, 768, 1440]) {
  const c = await b.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    colorScheme: "dark",
    reducedMotion: "reduce",
  });
  await routes(c);
  const p = await c.newPage();
  await p.goto("http://localhost:4178/?review=1");
  await p.evaluate(() => document.fonts.ready);
  await p
    .locator(".cover-stack img")
    .evaluateAll(async (es) =>
      Promise.all(
        es.map((i) =>
          Promise.race([
            i.decode().catch(() => {}),
            new Promise((r) => setTimeout(r, 5000)),
          ]),
        ),
      ),
    );
  await p.screenshot({ path: path("hero-dark-still-" + width + ".png") });
  await c.close();
}
const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
const img = async (n) =>
  "data:image/png;base64," +
  (await readFile(new URL(n, root))).toString("base64");
const tile = async (n, label) =>
  '<figure><img src="' +
  (await img(n)) +
  '"/><figcaption>' +
  label +
  "</figcaption></figure>";
const css =
  "<style>*{box-sizing:border-box}body{margin:0;padding:38px;background:#f4f0e7;color:#26212b;font:18px Arial}h1{font:54px Georgia;margin:0 0 14px}h2{font:36px Georgia;margin:35px 0 16px}p{max-width:1100px;line-height:1.6}.row{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-bottom:30px}figure{margin:0}img{width:100%;height:360px;object-fit:contain;object-position:top;background:#e9e2d9}figcaption{font-size:15px;line-height:1.5;margin:8px 0}.phone img{height:630px}.strip img{height:420px}.wide img{height:1450px;object-fit:cover;object-position:top}</style>";
let html =
  '<h1>Otaku Oracle / owner refinement</h1><p>The approved three-card composition and original face stay. The atmosphere now continues behind the type; shuffled covers and notes share one front-title state. All response fixtures are labelled; these images are visual evidence, not accuracy results.</p><h2>Before / hard vertical separation</h2><div class="row">';
for (const [w, name] of [
  [1440, "desktop-1440"],
  [768, "tablet-768"],
  [390, "phone-390"],
])
  html += await tile("final/" + name + "/idle.png", w + " px / before");
html += '</div><h2>After / one continuous world</h2><div class="row">';
for (const w of [1440, 768, 390])
  html += await tile(
    "refinement/hero-" + w + ".png",
    w + " px / blended atmosphere",
  );
html += '</div><h2>Dark still poster / same footprint</h2><div class="row">';
for (const w of [1440, 768, 390])
  html += await tile(
    "refinement/hero-dark-still-" + w + ".png",
    w + " px / dark and reduced motion",
  );
html +=
  '</div><h2>A changing front title, its own source note</h2><div class="row strip">';
for (let i = 0; i < 6; i++)
  html += await tile(
    "refinement/shuffle-" + i + ".png",
    "Sequence " + i + " / actual carousel change, matching note",
  );
html +=
  '</div><h2>Jointed walk / actual scroll samples at four times scale</h2><div class="wide">' +
  (await tile(
    "refinement/walk-cycle-4x.png",
    "Twelve road-distance samples; full-resolution close-up in walk-cycle-4x.png",
  )) +
  "</div><p>The two-step cycle plants stance feet, lifts the passing foot and counter-swings the arms. A sprite pack can replace the built-in drawing; docs/MASCOT_ASSET_SPEC.md specifies the supported file contract. Remaining limits: short stylized legs, externally hosted artwork, truncated long source-note titles with full text on hover/focus tooltip. Hardware touch and screen-reader verification remain outstanding.</p>";
await p.setContent(css + html);
await p.screenshot({ path: path("contact-sheet.png"), fullPage: true });
let strip =
  '<h1>The cover shuffle and matching source notes</h1><p>Eight distinct fronts sampled from the actual 4.8-second carousel, with finite incoming-cover preloading. Hover/focus pauses; leaving resumes. A single cached metadata request supplies popular and trending records.</p><div class="row strip">';
for (let i = 0; i < 8; i++)
  strip += await tile("refinement/shuffle-" + i + ".png", "Front " + i);
strip += "</div>";
await p.setContent(css + strip);
await p.screenshot({ path: path("shuffle-strip.png"), fullPage: true });
await writeFile(
  path("capture-note.json"),
  JSON.stringify(
    {
      before:
        "Existing PR review captures; same widths, different randomized titles after refinement",
      after:
        "Current production preview with public metadata fixture and no answer call",
      atlas: "Colored test atlas is test-only, not character artwork",
    },
    null,
    2,
  ) + "\n",
);
await b.close();
console.log(
  "Before/after, dark still variants and shuffle contact sheets ready",
);
