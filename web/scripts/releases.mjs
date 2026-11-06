import { writeFile } from "node:fs/promises";
import pkg from "../package.json" with { type: "json" };
const rows = [];
for (const [name, version] of Object.entries({
  ...pkg.dependencies,
  ...pkg.devDependencies,
})) {
  const res = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}`,
  );
  const m = await res.json();
  const date = m.time?.[version];
  if (!date || new Date(date) > new Date("2026-10-23T00:00:00Z"))
    throw new Error(`Release too recent or absent: ${name}`);
  rows.push({ package: name, version, published: date });
}
await writeFile(
  new URL("../../docs/dependency-releases.json", import.meta.url),
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(`${rows.length} exact versions verified older than two weeks`);
