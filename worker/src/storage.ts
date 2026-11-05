import type { AnimeRecord } from "./types";
export interface StoredRecord {
  record: AnimeRecord;
  fetchedAt: number;
}
export class Store {
  constructor(readonly db: D1Database) {}
  async consume(key: string, limit: number, expires: number): Promise<boolean> {
    if (limit <= 0) return false;
    const row = await this.db
      .prepare(
        `INSERT INTO counters(key,value,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET value=value+1 WHERE value < ? RETURNING value`,
      )
      .bind(key, expires, limit)
      .first();
    return row !== null;
  }
  async getRecord(id: number): Promise<StoredRecord | null> {
    const row = await this.db
      .prepare("SELECT record,fetched_at FROM records WHERE key=?")
      .bind(`v1:${id}`)
      .first<{ record: string; fetched_at: number }>();
    return row
      ? { record: JSON.parse(row.record), fetchedAt: row.fetched_at }
      : null;
  }
  async putRecord(record: AnimeRecord, now: number) {
    await this.db
      .prepare(
        "INSERT INTO records(key,record,fetched_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET record=excluded.record,fetched_at=excluded.fetched_at",
      )
      .bind(`v1:${record.id}`, JSON.stringify(record), now)
      .run();
  }
  async lease(id: number, token: string, now: number): Promise<boolean> {
    const row = await this.db
      .prepare(
        "INSERT INTO leases(key,token,until_ms) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET token=excluded.token,until_ms=excluded.until_ms WHERE until_ms <= ? RETURNING token",
      )
      .bind(`v1:${id}`, token, now + 15000, now)
      .first();
    return row !== null;
  }
  async release(id: number, token: string) {
    await this.db
      .prepare("DELETE FROM leases WHERE key=? AND token=?")
      .bind(`v1:${id}`, token)
      .run();
  }
  async upstream(now: number): Promise<boolean> {
    const result = await this.db.batch([
      this.db
        .prepare("DELETE FROM upstream_events WHERE at_ms <= ?")
        .bind(now - 60000),
      this.db
        .prepare(
          "INSERT INTO upstream_events(id,at_ms) SELECT ?,? WHERE (SELECT COUNT(*) FROM upstream_events WHERE at_ms > ?) < 25 RETURNING id",
        )
        .bind(crypto.randomUUID(), now, now - 60000),
    ]);
    return result[1].results.length > 0;
  }
  async circuit(id: string): Promise<number> {
    return (
      (
        await this.db
          .prepare("SELECT until_ms FROM circuits WHERE provider=?")
          .bind(id)
          .first<{ until_ms: number }>()
      )?.until_ms ?? 0
    );
  }
  async openCircuit(id: string, until: number) {
    await this.db
      .prepare(
        "INSERT INTO circuits(provider,until_ms) VALUES(?,?) ON CONFLICT(provider) DO UPDATE SET until_ms=MAX(until_ms,excluded.until_ms)",
      )
      .bind(id, until)
      .run();
  }
  async catalog(id: string, now: number): Promise<string[] | null> {
    const row = await this.db
      .prepare(
        "SELECT models FROM catalogs WHERE provider=? AND expires_at > ?",
      )
      .bind(id, now)
      .first<{ models: string }>();
    return row ? JSON.parse(row.models) : null;
  }
  async putCatalog(id: string, models: string[], now: number) {
    await this.db
      .prepare(
        "INSERT INTO catalogs(provider,models,expires_at) VALUES(?,?,?) ON CONFLICT(provider) DO UPDATE SET models=excluded.models,expires_at=excluded.expires_at",
      )
      .bind(id, JSON.stringify(models), now + 3600000)
      .run();
  }
  async cleanup(now: number) {
    await this.db.batch([
      this.db.prepare("DELETE FROM counters WHERE expires_at < ?").bind(now),
      this.db.prepare("DELETE FROM leases WHERE until_ms < ?").bind(now),
      this.db.prepare("DELETE FROM circuits WHERE until_ms < ?").bind(now),
      this.db.prepare("DELETE FROM catalogs WHERE expires_at < ?").bind(now),
    ]);
  }
}
export function daily(now: number) {
  const day = new Date(now).toISOString().slice(0, 10);
  return { day, end: Date.parse(`${day}T00:00:00Z`) + 86400000 };
}
export async function clientHash(
  ip: string,
  secret: string,
  day: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const hash = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${day}:${ip}`),
  );
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
