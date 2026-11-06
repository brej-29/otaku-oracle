import { chromium } from "playwright";
const b = await chromium.launch({ channel: "msedge" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("https://www.liquidink.design/github_web/", {
  waitUntil: "domcontentloaded",
});
await p.waitForTimeout(6000);
for (let i = 1; i <= 3; i++) {
  await p.mouse.wheel(0, 1000);
  await p.waitForTimeout(2500);
  await p.screenshot({
    path: `D:/Project/anime-app-wt/design-saga/docs/shots/saga/references/crossing-wheel-${i}.png`,
  });
}
await b.close();
console.log("Wheel journey captured");
