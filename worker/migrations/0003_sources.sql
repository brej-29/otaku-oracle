CREATE TABLE IF NOT EXISTS source_cache (key TEXT PRIMARY KEY, payload TEXT NOT NULL, fetched_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS source_events (id TEXT PRIMARY KEY, source TEXT NOT NULL, at_ms INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS source_events_time ON source_events(source,at_ms);
CREATE TABLE IF NOT EXISTS source_locks (key TEXT PRIMARY KEY, until_ms INTEGER NOT NULL);
