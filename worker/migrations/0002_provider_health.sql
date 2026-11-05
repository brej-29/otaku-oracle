CREATE TABLE provider_health (provider TEXT PRIMARY KEY, last_success INTEGER NOT NULL DEFAULT 0, last_failure INTEGER NOT NULL DEFAULT 0);
