import { classify } from "./classify";
import { collectSources } from "./sources";
import { extendAnswer } from "./verification";
import { Deadline, duration, requestDuration } from "./deadline";
import { explanation } from "./explanation";
import { getRecord } from "./anilist";
import { checkClaim, recordClaims } from "./checker";
import { readLimited } from "./parse";
import { credential, draftAnswer, providers } from "./providers";
import { clientHash, daily, Store } from "./storage";
import { ApiError, type Answer, type Env, type Fetcher } from "./types";
const MAX_BODY = 2048;
// AniList rejects Cloudflare egress IPs, so AniList calls can go through a relay on another network.
function relayed(fetcher: Fetcher, env: Env): Fetcher {
  if (!env.ANILIST_RELAY_URL) return fetcher;
  return (input, init) =>
    String(input).startsWith("https://graphql.anilist.co")
      ? fetcher(env.ANILIST_RELAY_URL!, {
          ...init,
          headers: {
            ...(init?.headers as object),
            "x-relay-key": env.ANILIST_RELAY_KEY ?? "",
          },
        })
      : fetcher(input, init);
}
function settings(env: Env) {
  if (
    !env.DB ||
    !env.IP_HASH_SECRET ||
    env.IP_HASH_SECRET.length < 16 ||
    !/^https?:\/\//.test(env.SITE_ORIGIN)
  )
    throw new Error("configuration");
  for (const key of [
    "CLIENT_DAILY_LIMIT",
    "MODEL_DAILY_BUDGET",
    "PROVIDER_COOLDOWN_SECONDS",
  ] as const)
    if (
      !/^\d+$/.test(env[key] ?? "") ||
      !Number.isSafeInteger(Number(env[key]))
    )
      throw new Error("configuration");
  if (new URL(env.SITE_ORIGIN).origin !== env.SITE_ORIGIN)
    throw new Error("configuration");
  duration(env.PROVIDER_TIMEOUT_MS, 8000);
  requestDuration(env);
  providers(env);
}
export async function handle(
  request: Request,
  env: Env,
  fetcher: Fetcher = fetch,
  context?: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  const started = Date.now();
  let deadline: Deadline | undefined;
  const origin = request.headers.get("Origin");
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  });
  if (origin === env.SITE_ORIGIN)
    headers.set("Access-Control-Allow-Origin", origin);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  // Reject hostile origins, including preflight; server-to-server callers still meet quotas.
  if (origin && origin !== env.SITE_ORIGIN)
    return json({ error: "invalid_request" }, 400);
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Access-Control-Max-Age", "600");
    return new Response(null, { status: 204, headers });
  }
  try {
    const path = new URL(request.url).pathname;
    if (path === "/api/health" && request.method === "GET")
      return json({
        ok: true,
        providers: providers(env).map((p) => ({
          id: p.id,
          configured: Boolean(credential(env, p)),
        })),
      });
    if (path !== "/api/ask" || request.method !== "POST")
      return json({ error: "invalid_request" }, 400);
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        request.headers.get("Content-Type") ?? "",
      )
    )
      throw new ApiError(400, "invalid_request");
    const length = request.headers.get("Content-Length");
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY))
      throw new ApiError(400, "invalid_request");
    deadline = new Deadline(started + requestDuration(env));
    let input: any;
    try {
      input = JSON.parse(
        await deadline.run((signal) => readLimited(request, MAX_BODY, signal)),
      );
    } catch {
      throw new ApiError(400, "invalid_request");
    }
    if (
      !input ||
      Array.isArray(input) ||
      typeof input !== "object" ||
      Object.keys(input).some((k) => !["titleId", "question"].includes(k)) ||
      !Number.isSafeInteger(input.titleId) ||
      input.titleId <= 0 ||
      input.titleId > 2147483647 ||
      typeof input.question !== "string" ||
      !input.question.trim() ||
      [...input.question].length > 200 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(input.question)
    )
      throw new ApiError(400, "invalid_request");
    settings(env);
    const store = new Store(env.DB);
    const now = Date.now(),
      period = daily(now);
    // CF-Connecting-IP is set by Cloudflare; X-Forwarded-For is deliberately ignored.
    const client = await clientHash(
      request.headers.get("CF-Connecting-IP") ?? "local",
      env.IP_HASH_SECRET,
      period.day,
    );
    if (
      !(await store.consume(
        `client:${period.day}:${client}`,
        Number(env.CLIENT_DAILY_LIMIT),
        period.end,
      ))
    )
      throw new ApiError(
        429,
        "rate_limited",
        Math.max(1, Math.ceil((period.end - now) / 1000)),
      );
    const result = await getRecord(
      input.titleId,
      store,
      relayed(fetcher, env),
      Date.now(),
      deadline,
    );
    const route = classify(input.question.trim());
    const expanded = env.MULTI_SOURCE_ENABLED === "true";
    const evidence = expanded
      ? collectSources(result.record, route.kind, env, store, fetcher, deadline)
      : Promise.resolve([]);
    const sourceOnly =
      !!route.unsupported ||
      (expanded &&
        (route.kind !== "fact" ||
          route.fields.every(
            (f) =>
              ![
                "studio",
                "episodes",
                "year",
                "format",
                "source",
                "season",
              ].includes(f),
          )));
    const attempt = sourceOnly
      ? Promise.resolve({ draft: null, model: null, degraded: false })
      : draftAnswer(
          input.question.trim(),
          { ...result.record, details: undefined, resourceLinks: undefined },
          env,
          store,
          fetcher,
          deadline,
        );
    // The response deadline also bounds slow bookkeeping; persist cooldowns in
    // waitUntil if a provider finishes abort cleanup after record-only is sent.
    context?.waitUntil(attempt.then(() => {}).catch(() => {}));
    const model = await deadline
      .run(() => attempt)
      .catch(() => ({ draft: null, model: null, degraded: true }));
    const claims = model.draft
      ? model.draft.claims.map((c, i) => checkClaim(result.record, c, i))
      : recordClaims(result.record);
    const response: Answer = {
      title: result.record.title,
      record: result.record,
      fetchedAt: new Date(result.fetchedAt).toISOString(),
      recordCached: result.cached,
      mode: model.draft ? "model" : "record-only",
      model: model.model,
      claims,
      explanation: model.draft
        ? explanation(model.draft, claims, result.record)
        : null,
      quota: {
        state: sourceOnly
          ? "ok"
          : model.draft
            ? model.degraded
              ? "degraded"
              : "ok"
            : "exhausted",
      },
      notice: route.unsupported
        ? "AniList does not record how much of the source material has been adapted, so there is no checked answer to this question. The record's facts are shown instead."
        : sourceOnly
          ? "Showing source data and related links; no drafted answer was requested."
          : model.draft
            ? model.degraded
              ? "A backup answer service was used; the original record is linked for every claim."
              : null
            : "The answer service is unavailable or its free allowance is used up. Showing facts from the source record.",
    };
    if (expanded) {
      const values = await deadline.run(() => evidence).catch(() => []);
      return json(extendAnswer(response, route.kind, route.fields, values));
    }
    return json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429)
        headers.set("Retry-After", String(error.retryAfter ?? 60));
      return json(
        {
          error: error.code,
          ...(error.status === 429
            ? { retryAfter: error.retryAfter ?? 60 }
            : {}),
          ...(error.status === 502
            ? { message: "The source service is temporarily unavailable." }
            : {}),
        },
        error.status,
      );
    }
    return json(
      {
        error: "upstream",
        message: "The answer service is temporarily unavailable.",
      },
      502,
    );
  } finally {
    deadline?.close();
  }
}
export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    handle(request, env, fetch, ctx),
  scheduled: (_event: ScheduledController, env: Env, ctx: ExecutionContext) =>
    ctx.waitUntil(new Store(env.DB).cleanup(Date.now())),
};
