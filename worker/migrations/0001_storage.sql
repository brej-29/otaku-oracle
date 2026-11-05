CREATE TABLE counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX counters_expiry ON counters(expires_at);
CREATE TABLE records (key TEXT PRIMARY KEY, record TEXT NOT NULL, fetched_at INTEGER NOT NULL);
CREATE TABLE leases (key TEXT PRIMARY KEY, token TEXT NOT NULL, until_ms INTEGER NOT NULL);
CREATE TABLE upstream_events (id TEXT PRIMARY KEY, at_ms INTEGER NOT NULL);
CREATE INDEX upstream_events_time ON upstream_events(at_ms);
CREATE TABLE circuits (provider TEXT PRIMARY KEY, until_ms INTEGER NOT NULL);
CREATE TABLE catalogs (provider TEXT PRIMARY KEY, models TEXT NOT NULL, expires_at INTEGER NOT NULL);
