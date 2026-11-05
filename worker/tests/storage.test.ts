import { beforeAll, beforeEach, afterAll, it, expect } from "vitest";
import { database, record } from "./fixtures";
import { Store, clientHash } from "../src/storage";
import { retryAt } from "../src/providers";
let db: D1Database,
  mf: Awaited<ReturnType<typeof database>>["mf"],
  store: Store;
beforeAll(async () => {
  ({ db, mf } = await database());
  store = new Store(db);
});
afterAll(async () => {
  await mf?.dispose();
});
beforeEach(async () => {
  for (const name of [
    "counters",
    "records",
    "leases",
    "upstream_events",
    "circuits",
    "catalogs",
    "provider_health",
  ])
    await db.prepare(`DELETE FROM ${name}`).run();
});
it("atomically admits only the daily allowance under concurrency", async () => {
  const results = await Promise.all(
    Array.from({ length: 40 }, () =>
      store.consume("model:today", 5, 9999999999999),
    ),
  );
  expect(results.filter(Boolean)).toHaveLength(5);
  expect(await db.prepare("SELECT value FROM counters").first("value")).toBe(5);
});
it("denies a zero budget without writing", async () => {
  expect(await store.consume("zero", 0, 100)).toBe(false);
});
it("uses a real sliding minute across window boundaries", async () => {
  const results = await Promise.all(
    Array.from({ length: 30 }, () => store.upstream(59000)),
  );
  expect(results.filter(Boolean)).toHaveLength(25);
  expect(await store.upstream(61000)).toBe(false);
  expect(await store.upstream(119000)).toBe(true);
});
it("coordinates exclusive fetch leases and owner-only release", async () => {
  expect(await store.lease(1, "owner", 100)).toBe(true);
  expect(await store.lease(1, "other", 101)).toBe(false);
  await store.release(1, "other");
  expect(await store.lease(1, "other", 102)).toBe(false);
  expect(await store.lease(1, "next", 15101)).toBe(true);
});
it("persists versioned records and timestamps", async () => {
  await store.putRecord(record, 42);
  expect(await store.getRecord(1)).toEqual({ record, fetchedAt: 42 });
});
it("opens and extends circuits without shortening Retry-After", async () => {
  await store.openCircuit("first", 9000);
  await store.openCircuit("first", 1000);
  expect(await store.circuit("first")).toBe(9000);
  expect(retryAt("3600", 1000, 900)).toBe(3601000);
  expect(retryAt(new Date(7200000).toUTCString(), 1000, 900)).toBe(7200000);
  expect(retryAt(null, 1000, 900)).toBe(901000);
});
it("stores an expiring free catalog", async () => {
  await store.putCatalog("p", ["dummy:free"], 10);
  expect(await store.catalog("p", 20)).toEqual(["dummy:free"]);
  expect(await store.catalog("p", 3600011)).toBeNull();
});
it("hashes IP with a daily secret salt and never stores raw addresses", async () => {
  const a = await clientHash("1.2.3.4", "secret", "2026-11-06");
  expect(a).toHaveLength(64);
  expect(a).not.toContain("1.2.3.4");
  expect(await clientHash("1.2.3.4", "secret", "2026-11-07")).not.toBe(a);
});
it("cleans expired counters and transient coordination state", async () => {
  await store.consume("old", 1, 10);
  await store.openCircuit("p", 10);
  await store.cleanup(20);
  expect(
    await db.prepare("SELECT COUNT(*) AS n FROM counters").first("n"),
  ).toBe(0);
  expect(await store.circuit("p")).toBe(0);
});

it("persists recent provider success/failure and its cooldown", async () => {
  await store.healthy("first", 100);
  await store.unhealthy("first", 200, 900);
  expect(await store.health()).toEqual([
    { provider: "first", last_success: 100, last_failure: 200, until_ms: 900 },
  ]);
  await store.healthy("first", 1000);
  expect((await store.health())[0].last_success).toBe(1000);
});
