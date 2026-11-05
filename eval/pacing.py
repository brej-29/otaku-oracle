"""Conservative rolling-window quota reservations, persisted across resumes."""

import json
import time
from pathlib import Path

from .network import RequestFailed, now, write_json


def input_bound(payload):
    # Byte-fallback tokenization cannot exceed UTF-8 byte count; reserve ample framing overhead.
    return len(json.dumps(payload.get("messages", []), ensure_ascii=False).encode("utf-8")) + 256


class Budget:
    def __init__(self, provider):
        self.provider = provider
        self.path = Path(provider["quota_ledger"])
        self.entries = json.loads(self.path.read_text(encoding="utf-8")) if self.path.exists() else []
        self.current = None

    def before(self, payload):
        cost = input_bound(payload) + payload.get("max_completion_tokens", payload.get("max_tokens", 256))
        while True:
            stamp = time.time()
            self.entries = [e for e in self.entries if stamp - e["time"] < 86400]
            recent = [e for e in self.entries if stamp - e["time"] < 60]
            if (cost > self.provider["minute_tokens"] or len(self.entries) >= self.provider["daily_requests"]
                    or sum(e["tokens"] for e in self.entries) + cost > self.provider["daily_tokens"]):
                raise RequestFailed([{"at": now(), "status": "local_quota_pause", "codes": ["conservative_budget"], "messages": []}])
            if recent and (len(recent) >= self.provider["minute_requests"] or
                           sum(e["tokens"] for e in recent) + cost > self.provider["minute_tokens"]):
                time.sleep(max(.01, 60 - (stamp - recent[0]["time"]) + .1))
                continue
            self.current = {"time": stamp, "tokens": cost, "input_byte_bound": input_bound(payload), "status": "reserved"}
            self.entries.append(self.current)
            write_json(self.path, self.entries)
            return

    def after(self, response, metadata):
        if self.current is None:
            return
        usage = (response or {}).get("usage") or {}
        actual = usage.get("total_tokens")
        if isinstance(actual, int) and actual > 0:
            self.current["tokens"] = actual
        self.current.update(status=metadata["status"], measured_prompt_tokens=usage.get("prompt_tokens"),
                            measured_total_tokens=actual, rate_headers=metadata.get("rate_headers", {}))
        write_json(self.path, self.entries)
