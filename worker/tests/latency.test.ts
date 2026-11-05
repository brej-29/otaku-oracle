import { afterEach, expect, it, vi } from "vitest";
import { Deadline, requestDuration } from "../src/deadline";
import { draftAnswer, healthOrder } from "../src/providers";
import { Store, type ProviderHealth } from "../src/storage";
import type { Fetcher, Env } from "../src/types";
import { draft, record, environment, provider } from "./fixtures";
class MemoryStore extends Store {
  rows = new Map<string, ProviderHealth>();
  calls = 0;
  constructor() {
    super({} as D1Database);
  }
  async health() {
    return [...this.rows.values()];
  }
  async consume(_key: string, limit: number) {
    if (this.calls >= limit) return false;
    this.calls++;
    return true;
  }
  async healthy(id: string, now: number) {
    const old = this.rows.get(id);
    this.rows.set(id, {
      provider: id,
      last_success: now,
      last_failure: old?.last_failure ?? 0,
      until_ms: old?.until_ms ?? 0,
    });
  }
  async unhealthy(id: string, now: number, until: number) {
    const old = this.rows.get(id);
    this.rows.set(id, {
      provider: id,
      last_success: old?.last_success ?? 0,
      last_failure: now,
      until_ms: Math.max(old?.until_ms ?? 0, until),
    });
  }
}
function setup(changes: Partial<Env> = {}) {
  vi.useFakeTimers();
  vi.setSystemTime(2000000000000);
  const store = new MemoryStore();
  const env = environment(store.db, {
    PROVIDERS_JSON: JSON.stringify([
      provider("first"),
      provider("second"),
      provider("third"),
    ]),
    ...changes,
  });
  return { store, env };
}
const ok = () =>
  new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(draft) } }],
    }),
  );
afterEach(() => {
  vi.useRealTimers();
});
it("aborts the default 8s provider scope and immediately uses a backup", async () => {
  const { store, env } = setup();
  let signal: AbortSignal | undefined;
  const net = vi.fn(async (url, init) => {
    if (String(url).includes("first.")) {
      signal = init?.signal as AbortSignal;
      return new Promise<Response>(() => {});
    }
    return ok();
  }) as unknown as Fetcher;
  const start = Date.now();
  const pending = draftAnswer("Question", record, env, store, net);
  await vi.advanceTimersByTimeAsync(8000);
  expect((await pending).model?.provider).toBe("second");
  expect(Date.now() - start).toBe(8000);
  expect(signal?.aborted).toBe(true);
  expect(store.calls).toBe(2);
  expect(store.rows.get("first")!.until_ms).toBeGreaterThan(Date.now());
});
it("uses config per-provider timeout overrides", async () => {
  const { store, env } = setup({ PROVIDER_TIMEOUT_MS: "40" });
  env.PROVIDERS_JSON = JSON.stringify([
    { ...provider("first"), timeoutMs: 20 },
    provider("second"),
  ]);
  const net = vi.fn(async (url) =>
    String(url).includes("first.") ? new Promise<Response>(() => {}) : ok(),
  ) as unknown as Fetcher;
  const pending = draftAnswer("Question", record, env, store, net);
  await vi.advanceTimersByTimeAsync(20);
  expect((await pending).model?.provider).toBe("second");
});
it("enforces the total 15s deadline and never starts a third call", async () => {
  const { store, env } = setup();
  const signals: AbortSignal[] = [];
  const net = vi.fn(async (_url, init) => {
    signals.push(init?.signal as AbortSignal);
    return new Promise<Response>(() => {});
  }) as unknown as Fetcher;
  const pending = draftAnswer("Question", record, env, store, net);
  await vi.advanceTimersByTimeAsync(15000);
  expect((await pending).draft).toBeNull();
  expect(net).toHaveBeenCalledTimes(2);
  expect(store.calls).toBe(2);
  expect(signals.every((s) => s.aborted)).toBe(true);
});
it("uses only the deadline remaining after source retrieval", async () => {
  const { store, env } = setup();
  const deadline = new Deadline(Date.now() + 7000);
  const net = vi.fn(
    async () => new Promise<Response>(() => {}),
  ) as unknown as Fetcher;
  const pending = draftAnswer("Question", record, env, store, net, deadline);
  await vi.advanceTimersByTimeAsync(7000);
  expect((await pending).draft).toBeNull();
  expect(store.calls).toBe(1);
  deadline.close();
});
it("moves a successful backup ahead of a previously timed-out provider", async () => {
  const { store, env } = setup();
  const seen: string[] = [];
  const net = vi.fn(async (url) => {
    seen.push(String(url));
    if (String(url).includes("first.")) return new Promise<Response>(() => {});
    return ok();
  }) as unknown as Fetcher;
  const pending = draftAnswer("Question", record, env, store, net);
  await vi.advanceTimersByTimeAsync(8000);
  await pending;
  seen.length = 0;
  expect(
    (await draftAnswer("Question", record, env, store, net)).model?.provider,
  ).toBe("second");
  expect(seen).toHaveLength(1);
  expect(seen[0]).toContain("second.");
});
it("prioritizes recent success, then unknown, then failures and open circuits", () => {
  const now = 2000000000000,
    list = [
      provider("failed"),
      provider("open"),
      provider("unknown"),
      provider("healthy"),
    ];
  const rows = [
    {
      provider: "healthy",
      last_success: now - 10,
      last_failure: 0,
      until_ms: 0,
    },
    {
      provider: "failed",
      last_success: 0,
      last_failure: now - 10,
      until_ms: now - 1,
    },
    {
      provider: "open",
      last_success: 0,
      last_failure: now - 10,
      until_ms: now + 1000,
    },
  ];
  expect(healthOrder(list, rows, now).map((p) => p.id)).toEqual([
    "healthy",
    "unknown",
    "failed",
    "open",
  ]);
});
it("does not hedge or spend a second budget unit when the first provider works", async () => {
  const { store, env } = setup();
  const net = vi.fn(async () => ok()) as unknown as Fetcher;
  expect(
    (await draftAnswer("Question", record, env, store, net)).model?.provider,
  ).toBe("first");
  expect(store.calls).toBe(1);
  expect(net).toHaveBeenCalledTimes(1);
});
it("never initiates a call after a deadline that is already spent", async () => {
  const { store, env } = setup();
  const deadline = new Deadline(Date.now() - 1);
  const net = vi.fn(async () => ok()) as unknown as Fetcher;
  expect(
    (await draftAnswer("Question", record, env, store, net, deadline)).draft,
  ).toBeNull();
  expect(net).not.toHaveBeenCalled();
  expect(store.calls).toBe(0);
  deadline.close();
});
it("applies the configured total limit with validated defaults", () => {
  expect(requestDuration({} as Env)).toBe(15000);
  expect(requestDuration({ REQUEST_DEADLINE_MS: "25" } as Env)).toBe(25);
  expect(() => requestDuration({ REQUEST_DEADLINE_MS: "0" } as Env)).toThrow();
});
