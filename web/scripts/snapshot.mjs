import { writeFile, mkdir } from "node:fs/promises";
const query = `query{Page(perPage:4){media(id_in:[154587,1,16498,199],type:ANIME){id title{romaji english native} format episodes status season seasonYear source startDate{year} coverImage{extraLarge large medium color} studios(isMain:true){nodes{name}} siteUrl genres characters(role:MAIN){pageInfo{total}}}}}`;
const res = await fetch("https://graphql.anilist.co", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
  signal: AbortSignal.timeout(15000),
});
const data = await res.json();
if (!res.ok || data.errors) throw new Error("Source snapshot unavailable");
await mkdir(new URL("fixtures/", import.meta.url), { recursive: true });
await writeFile(
  new URL("fixtures/anilist.json", import.meta.url),
  JSON.stringify(
    { query, fetchedAt: new Date().toISOString(), ...data },
    null,
    2,
  ),
);
console.log(
  `Cached ${data.data.Page.media.length} real source records for browser fixtures`,
);
