import snapshot from "./fixtures/anilist.json" with { type: "json" };
export const raw = snapshot.data.Page.media.find((r) => r.id === 154587);
export const record = {
  id: raw.id,
  title: raw.title.english || raw.title.romaji,
  native: raw.title.native,
  format: raw.format,
  episodes: raw.episodes,
  studios: raw.studios.nodes.map((s) => s.name),
  year: raw.startDate.year,
  season: raw.season,
  seasonYear: raw.seasonYear,
  source: raw.source,
  cover: raw.coverImage.extraLarge,
  color: raw.coverImage.color,
  url: raw.siteUrl,
  genres: raw.genres,
};
export const claim = (
  field,
  value,
  status = "verified",
  recordValue = value,
) => ({
  id: `${field}-${status}`,
  text:
    field === "studio"
      ? `Animation studios: ${record.studios.join(", ")}.`
      : field === "episodes"
        ? `Episode count: ${value}.`
        : "An interpretation of the story that this record cannot check.",
  field,
  value,
  status,
  recordValue,
  sourceUrl: record.url,
});
export function fixture(kind = "verified") {
  let claims = [
    claim("studio", JSON.stringify(record.studios)),
    claim("episodes", String(record.episodes)),
  ];
  if (kind === "conflict")
    claims = [claim("episodes", "99", "conflict", String(record.episodes))];
  if (kind === "unchecked") claims = [claim(null, null, "unchecked", null)];
  if (kind === "three-states")
    claims = [
      claims[0],
      claim("episodes", "99", "conflict", String(record.episodes)),
      claim(null, null, "unchecked", null),
    ];
  return {
    title: record.title,
    record,
    fetchedAt: snapshot.fetchedAt,
    recordCached: true,
    mode: kind === "record-only" ? "record-only" : "model",
    model:
      kind === "record-only" ? null : { id: "fixture", provider: "fixture" },
    claims,
    explanation: null,
    quota: { state: kind === "record-only" ? "exhausted" : "ok" },
    notice:
      kind === "record-only"
        ? "The free answer allowance is unavailable. Showing facts from the source record."
        : null,
  };
}
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export async function routes(context, kind = "verified") {
  await context.route("https://graphql.anilist.co/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "POST,OPTIONS",
        },
      });
    const body = request.postDataJSON() ?? {};
    const page = body.query?.includes("Page");
    if (!page && kind === "loading-record") await delay(5000);
    const media = snapshot.data.Page.media;
    const data = page
      ? {
          Page: {
            media: body.variables?.s
              ? media.filter((m) =>
                  `${m.title.english} ${m.title.romaji}`
                    .toLowerCase()
                    .includes(body.variables.s.toLowerCase()),
                )
              : media,
          },
        }
      : { Media: media.find((m) => m.id === body.variables?.id) ?? null };
    await route
      .fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ data }),
      })
      .catch(() => {});
  });
  await context.route("**/api/ask", async (route) => {
    if (route.request().method() === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "POST,OPTIONS",
        },
      });
    if (kind === "loading-answer") await delay(6000);
    if (kind === "offline") return route.abort("internetdisconnected");
    const status = kind === "error" ? 502 : kind === "rate" ? 429 : 200;
    await route
      .fulfill({
        status,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify(
          status === 200
            ? fixture(kind)
            : {
                error: kind === "rate" ? "rate_limited" : "upstream",
                retryAfter: 60,
              },
        ),
      })
      .catch(() => {});
  });
}
export async function submit(page) {
  await page.getByRole("combobox", { name: "Anime title" }).fill("Frieren");
  await page.getByRole("option").first().waitFor();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page
    .getByRole("textbox", { name: "Your question" })
    .fill("Which studio animated it and how many episodes does it have?");
  await page
    .getByRole("button", { name: "Find the facts", exact: true })
    .click();
}
