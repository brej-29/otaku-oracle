import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { routes } from "./fixtures.mjs";
const root = new URL("../../docs/shots/saga/motion/", import.meta.url);
await mkdir(root, { recursive: true });
const b = await chromium.launch({ channel: "msedge" });
const c = await b.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
});
await routes(c);
const p = await c.newPage();
await p.goto("http://localhost:4178/?review=1");
await p.evaluate(() => document.fonts.ready);
const state = () =>
  p.locator(".hero-world").evaluate((e) => ({
    cloud: getComputedStyle(e.querySelector(".cloud-layer")).transform,
    lantern: getComputedStyle(e.querySelector(".hanging-lantern")).transform,
    particles: e.querySelector("canvas").toDataURL(),
  }));
await p.waitForTimeout(700);
const a = await state();
await p.screenshot({
  path: new URL("idle-a.png", root).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
});
await p.waitForTimeout(1200);
const z = await state();
await p.screenshot({
  path: new URL("idle-b.png", root).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
});
const matrix = [];
for (let i = 0; i < 9; i++) {
  const f = i / 8;
  await p.evaluate((f) => {
    const e = document.querySelector(".night-journey");
    scrollTo(
      0,
      e.getBoundingClientRect().top +
        scrollY +
        (e.offsetHeight - innerHeight) * f,
    );
  }, f);
  await p.locator(".scene-track").waitFor();
  await p.waitForTimeout(500);
  await p.screenshot({
    path: new URL("scroll-" + i + ".png", root).pathname.replace(
      /^\/([A-Za-z]:)/,
      "$1",
    ),
  });
  matrix.push(
    await p
      .locator(".scene-track")
      .evaluate((e) => getComputedStyle(e).transform),
  );
}
await p.getByRole("button", { name: "Pause motion", exact: true }).click();
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(250);
const pa = await state();
await p.waitForTimeout(700);
const pb = await state();
const sha = (s) => createHash("sha256").update(s).digest("hex");
const result = {
  idleCloudMoved: a.cloud !== z.cloud,
  idleLanternMoved: a.lantern !== z.lantern,
  idleParticlesMoved: sha(a.particles) !== sha(z.particles),
  cameraPanelsTravelled: new Set(matrix).size === 9,
  pausedStill:
    pa.cloud === pb.cloud &&
    pa.lantern === pb.lantern &&
    sha(pa.particles) === sha(pb.particles),
  cameraTransforms: matrix,
};
await writeFile(new URL("motion.json", root), JSON.stringify(result, null, 2));
await c.close();
await b.close();
console.log({ ...result, cameraTransforms: undefined });
if (Object.values(result).some((v) => v === false)) process.exitCode = 1;
