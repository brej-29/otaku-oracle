import lighthouse from "lighthouse";
import desktop from "lighthouse/core/config/desktop-config.js";
import { launch } from "chrome-launcher";
import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
const root = new URL("../../docs/lighthouse/journey/", import.meta.url);
await mkdir(root, { recursive: true });
const results = [];
for (const mode of ["mobile", "desktop"]) {
  const chrome = await launch({
    chromePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    chromeFlags: [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--no-first-run",
    ],
  });
  try {
    for (const [screen, path] of [
      ["home", "/"],
      ["why", "/?page=why"],
      ["how", "/?page=how"],
    ]) {
      const result = await lighthouse(
        `http://localhost:4178${path}`,
        {
          port: chrome.port,
          output: "json",
          logLevel: "error",
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
        },
        mode === "desktop" ? desktop : undefined,
      );
      const lhr = result.lhr;
      const scores = Object.fromEntries(
        Object.entries(lhr.categories).map(([k, c]) => [
          k,
          Math.round(c.score * 100),
        ]),
      );
      const row = { mode, screen, ...scores };
      results.push(row);
      console.log(row);
      await writeFile(
        new URL(`${mode}-${screen}.json`, root),
        result.report,
      );
    }
  } finally {
    await chrome.kill();
  }
}
let js = 0;
for (const f of await readdir(new URL("../dist/assets/", import.meta.url))) {
  if (f.endsWith(".js"))
    js += gzipSync(
      await readFile(new URL(`../dist/assets/${f}`, import.meta.url)),
    ).length;
}
const text = `# Journey performance\n\nProduction preview, standard mobile throttling and desktop preset. Measured locally, not field data.\n\n| Profile | Screen | Performance | Accessibility | Best practices | SEO |\n|---|---|---:|---:|---:|---:|\n${results.map((r) => `| ${r.mode} | ${r.screen} | ${r.performance} | ${r.accessibility} | ${r["best-practices"]} | ${r.seo} |`).join("\n")}\n\nFirst-load JavaScript: ${(js / 1024).toFixed(1)} KiB gzip. No motion framework, 3D bundle or runtime font service. Command from web/: node scripts/lighthouse.mjs. Raw reports: docs/lighthouse/journey/.\n`;
await writeFile(
  new URL("../../docs/lighthouse-journey.md", import.meta.url),
  text,
);
if (
  results.some((r) =>
    Object.entries(r).some(([_k, v]) => typeof v === "number" && v < 90),
  )
)
  process.exitCode = 1;
