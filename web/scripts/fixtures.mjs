import artSnapshot from "./fixtures/art-source.json" with { type: "json" };
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
  if (
    [
      "agreement",
      "source-conflict",
      "source-unchecked",
      "source-stale",
      "single-source",
      "news",
      "discussion",
      "unclear",
    ].includes(kind)
  )
    return sourceFixture(kind);

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
  // Explicit illustrative agreement metadata for the review fixture only.
  claims = claims.map((c) =>
    c.status !== "verified"
      ? c
      : {
          ...c,
          verification: {
            field: c.field,
            basis: "agreement",
            note: "Illustrative two-source fixture, not a live result.",
            evidence: [
              {
                sourceId: "anilist",
                source: "AniList",
                value: c.value,
                url: record.url,
                fetchedAt: snapshot.fetchedAt,
                stale: false,
              },
              {
                sourceId: "mal",
                source: "MyAnimeList via Jikan",
                value: c.value,
                url: "https://myanimelist.net/anime/52991",
                fetchedAt: snapshot.fetchedAt,
                stale: false,
              },
            ],
          },
        },
  );
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
    if (body.query?.includes("popular:Page")) {
      return route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          data: {
            popular: { media: artSnapshot.data.Page.media.slice(0, 20) },
            trending: { media: artSnapshot.data.Page.media.slice(12) },
          },
        }),
      });
    }
    const page = body.query?.includes("Page");
    if (!page && kind === "loading-record") await delay(15000);
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
export async function submit(
  page,
  question = "Which studio animated it and how many episodes does it have?",
) {
  await page.getByRole("combobox", { name: "Anime title" }).fill("Frieren");
  await page.getByRole("option").first().waitFor();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "Your question" }).fill(question);
  await page
    .getByRole("button", { name: "Find my answer", exact: true })
    .click();
}

export function sourceFixture(kind) {
  const info = (id, label, state = "available") => ({
    id,
    label,
    state,
    url:
      id === "anilist"
        ? record.url
        : id === "mal"
          ? "https://myanimelist.net/anime/52991"
          : "https://www.wikidata.org/wiki/Q130377145",
    fetchedAt: snapshot.fetchedAt,
    cached: true,
    note:
      state === "available"
        ? "Design-review fixture: source values are illustrative."
        : "Unavailable now / illustrative fixture",
  });
  const sources = [
    info("anilist", "AniList"),
    info(
      "mal",
      "MyAnimeList via Jikan",
      ["source-unchecked", "source-stale"].includes(kind)
        ? kind === "source-stale"
          ? "stale"
          : "unavailable"
        : "available",
    ),
    info("wikidata", "Wikidata", "unavailable"),
    {
      id: "reddit",
      label: "Reddit",
      state: "link-only",
      url: "https://www.reddit.com/r/anime/",
      fetchedAt: null,
      cached: false,
      note: "Search links only. No posts fetched.",
    },
  ];
  const c = claim(
    "episodes",
    "28",
    kind === "source-conflict"
      ? "conflict"
      : ["source-stale", "source-unchecked"].includes(kind)
        ? "unchecked"
        : "verified",
    "28",
  );
  c.verification = {
    field: "episodes",
    basis:
      kind === "source-conflict"
        ? "sources-disagree"
        : kind === "source-stale"
          ? "stale"
          : kind === "source-unchecked"
            ? "insufficient"
            : "agreement",
    note:
      kind === "source-conflict"
        ? "The sources list different values. Neither source is silently preferred."
        : kind === "source-stale"
          ? "Only stale or insufficient evidence is available. This remains unchecked."
          : kind === "source-unchecked"
            ? "A lone catalog match is not independent corroboration."
            : "Two retrieved catalogs agree; this is a labelled review fixture.",
    evidence: [
      {
        sourceId: "anilist",
        source: "AniList",
        value: "28",
        url: record.url,
        fetchedAt: snapshot.fetchedAt,
        stale: false,
      },
      ...(kind === "source-unchecked"
        ? []
        : [
            {
              sourceId: "mal",
              source: "MyAnimeList via Jikan",
              value: kind === "source-conflict" ? "29" : "28",
              url: "https://myanimelist.net/anime/52991",
              fetchedAt: snapshot.fetchedAt,
              stale: kind === "source-stale",
            },
          ]),
    ],
  };
  if (kind === "single-source") {
    c.field = null;
    c.value = "100";
    c.text = "AniList trending activity: 100. (Illustrative fixture)";
    c.verification = {
      field: "trending",
      basis: "single-source",
      note: "Single-source: AniList's own metric, not independent corroboration.",
      evidence: [
        {
          sourceId: "anilist",
          source: "AniList",
          value: "100",
          url: record.url,
          fetchedAt: snapshot.fetchedAt,
          stale: false,
        },
      ],
    };
  }
  const conversation = ["news", "discussion", "unclear"].includes(kind);
  const search = {
    kind: "search",
    title: "r/anime conversations",
    url: "https://www.reddit.com/r/anime/search/?q=Frieren&restrict_sr=1",
    source: "Reddit",
    publishedAt: null,
    score: null,
    scoreKind: null,
    label: "Search link, not verified",
  };
  const fetched =
    kind === "news"
      ? [
          {
            kind: "news",
            title: "Fixture headline: a new chapter in the journey",
            source: "MyAnimeList news",
            url: "https://myanimelist.net/news/1",
            publishedAt: "2026-11-01T00:00:00Z",
            score: 12,
            scoreKind: "replies",
            label: "Discussion, not verified",
          },
        ]
      : kind === "discussion"
        ? [
            {
              kind: "discussion",
              title: "Fixture thread: what did the ending mean to you?",
              source: "MyAnimeList forum",
              url: "https://myanimelist.net/forum/?topicid=1",
              publishedAt: "2026-11-02T00:00:00Z",
              score: 42,
              scoreKind: "replies",
              label: "Discussion, not verified",
            },
          ]
        : [];
  return {
    ...fixture("verified"),
    claims: conversation ? [] : [c],
    questionKind: conversation ? kind : "fact",
    resolution: {
      status: conversation ? "discussion" : c.status,
      summary: conversation
        ? kind === "unclear"
          ? "We could not settle this question with available facts. These are places to explore."
          : "Discussion and news links are leads, not verified facts."
        : c.verification.note,
    },
    sources,
    related: [
      ...fetched,
      search,
      {
        ...search,
        title: "Episode discussion search",
        url: "https://www.reddit.com/r/anime/search/?q=Frieren+episode+discussion&restrict_sr=1",
      },
      {
        ...search,
        kind: "reference",
        title: "Explore the exact title",
        source: "MyAnimeList",
        url: "https://myanimelist.net/anime/52991",
      },
    ],
  };
}
