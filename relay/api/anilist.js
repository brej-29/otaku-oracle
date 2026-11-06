// Forwards AniList GraphQL POSTs from the Worker; AniList blocks Cloudflare egress IPs.
export default async function handler(req, res) {
  if (req.method !== "POST" || req.headers["x-relay-key"] !== process.env.RELAY_KEY)
    return res.status(403).end();
  const r = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(req.body),
  });
  res.status(r.status).setHeader("Content-Type", "application/json").send(await r.text());
}
