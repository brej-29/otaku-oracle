import { readFileSync, readdirSync } from "node:fs";
import { URL } from "node:url";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import type { AnimeRecord, Draft, Env, Provider } from "../src/types";
export const record: AnimeRecord = {
  id: 1,
  title: "Cowboy Bebop",
  native: "?????????",
  episodes: 26,
  year: 1998,
  format: "TV",
  season: "SPRING",
  seasonYear: 1998,
  source: "ORIGINAL",
  studios: ["Sunrise"],
  url: "https://anilist.co/anime/1",
  cover: null,
  color: null,
  genres: ["Action"],
};
export const media = {
  id: 1,
  title: { english: record.title, romaji: record.title, native: record.native },
  episodes: 26,
  startDate: { year: 1998 },
  format: "TV",
  season: "SPRING",
  seasonYear: 1998,
  source: "ORIGINAL",
  studios: {
    edges: [
      { isMain: true, node: { name: "Sunrise", isAnimationStudio: true } },
    ],
  },
  coverImage: { large: null, color: null },
  genres: ["Action"],
};
export const draft: Draft = {
  answer: "The record lists 26 episodes.",
  claims: [{ text: "There are 26 episodes.", field: "episodes", value: "26" }],
  explanation: null,
};
export function provider(id = "first"): Provider {
  return {
    id,
    baseUrl: `https://${id}.example/v1`,
    keyEnv: "ZAI_API_KEY",
    models: ["dummy-free"],
    freeModels: ["dummy-free"],
    maxTokens: 256,
    options: { response_format: { type: "json_object" } },
  };
}
export async function database() {
  const mf = new Miniflare(
    convertV4MiniflareOptions({
      cf: false,
      modules: true,
      script: 'export default {fetch(){return new Response("local");}}',
      compatibilityDate: "2026-11-04",
      d1Databases: ["DB"],
    }),
  );
  const db = await mf.getD1Database("DB");
  for (const name of readdirSync(new URL("../migrations/", import.meta.url))
    .filter((n) => n.endsWith(".sql"))
    .sort())
    for (const sql of readFileSync(
      new URL(`../migrations/${name}`, import.meta.url),
      "utf8",
    )
      .split(";")
      .filter((s) => s.trim()))
      await db.prepare(sql).run();

  return { mf, db: db as unknown as D1Database };
}
export function environment(db: D1Database, changes: Partial<Env> = {}): Env {
  return {
    DB: db,
    SITE_ORIGIN: "https://site.example",
    IP_HASH_SECRET: "local-test-secret-over-sixteen",
    CLIENT_DAILY_LIMIT: "50",
    MODEL_DAILY_BUDGET: "100",
    PROVIDER_COOLDOWN_SECONDS: "900",
    ZAI_API_KEY: "dummy-test-credential",
    PROVIDERS_JSON: JSON.stringify([provider()]),
    ...changes,
  };
}
export function ask(
  body: unknown = { titleId: 1, question: "How many episodes?" },
  headers: Record<string, string> = {},
) {
  return new Request("https://worker.example/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://site.example",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
