import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { providers, credential, payload, selectFree } from "../src/providers";
import { parseDraft, readLimited } from "../src/parse";
import type { Env, Fetcher } from "../src/types";
// Synthetic transport check; no dataset prompts and no response content is printed.
const record = {
  id: 0,
  title: "Synthetic smoke record",
  native: null,
  format: "TV",
  episodes: 7,
  studios: ["Example Studio"],
  year: 2000,
  season: "SPRING",
  seasonYear: 2000,
  source: "ORIGINAL",
  cover: null,
  color: null,
  url: "https://anilist.co/anime/0",
  genres: [],
};
export async function smoke(
  env: Env,
  fetcher: Fetcher = fetch,
  write: (line: string) => void = console.log,
) {
  for (const p of providers(env)) {
    const key = credential(env, p);
    if (!key) {
      write(`${p.id}: unconfigured`);
      continue;
    }
    try {
      let models = p.models;
      if (p.discovery) {
        const catalog = await fetcher(`${p.baseUrl}/models`, {
          signal: AbortSignal.timeout(10000),
        });
        if (!catalog.ok) {
          write(`${p.id}: catalog_http_${catalog.status}`);
          await catalog.body?.cancel();
          continue;
        }
        models = selectFree(
          JSON.parse(await readLimited(catalog, 2000000)),
          p.models,
        );
      }
      if (!models.length) {
        write(`${p.id}: no_verified_free_model`);
        continue;
      }
      // Exactly one chat request per configured provider; no retries or fallbacks here.
      const res = await fetcher(`${p.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(
          payload(
            p,
            models[0],
            "How many episodes are in this synthetic record?",
            record,
          ),
        ),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        write(`${p.id}: http_${res.status}`);
        await res.body?.cancel();
        continue;
      }
      let status = "invalid_output";
      try {
        const data = JSON.parse(await readLimited(res, 60000));
        parseDraft(data.choices?.[0]?.message?.content);
        status = "valid_json";
      } catch {}
      write(`${p.id}: http_${res.status}_${status}`);
    } catch {
      write(`${p.id}: network_or_timeout`);
    }
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (existsSync(".dev.vars")) process.loadEnvFile(".dev.vars");
  try {
    await smoke(process.env as unknown as Env);
  } catch {
    console.log("smoke: invalid_configuration");
    process.exitCode = 1;
  }
}
