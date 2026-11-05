"""Small HTTP client with safe failure records and serial request pacing."""

import hashlib
import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def now():
    return datetime.now(timezone.utc).isoformat()


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(path)


class RequestFailed(Exception):
    def __init__(self, attempts):
        self.attempts = attempts
        super().__init__(f"Request failed: {attempts[-1]['status']}")


class Client:
    def __init__(self, interval=2.1, timeout=90):
        self.interval = interval
        self.timeout = timeout
        self.last = 0.0

    def request(self, url, payload=None, token=None):
        attempts = []
        for retry in range(3):
            time.sleep(max(0, self.interval - (time.monotonic() - self.last)))
            self.last = time.monotonic()
            headers = {"Content-Type": "application/json", "User-Agent": "OtakuOracle-Evaluation/0.1"}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            request = urllib.request.Request(url, data=json.dumps(payload).encode() if payload is not None else None, headers=headers)
            stamp = now()
            started = time.monotonic()
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    data = json.load(response)
                    attempts.append({"at": stamp, "status": response.status, "seconds": round(time.monotonic() - started, 3),
                                     "rate_limit": response.headers.get("X-RateLimit-Limit"),
                                     "rate_remaining": response.headers.get("X-RateLimit-Remaining")})
                    return data, attempts
            except urllib.error.HTTPError as error:
                # Record only JSON error messages with credentials redacted, never request headers.
                messages = []
                try:
                    body = json.loads(error.read(16384))
                    errors = body.get("errors", [body.get("error", {})])
                    for item in errors:
                        if isinstance(item, dict) and isinstance(item.get("message"), str):
                            message = item["message"]
                            messages.append(message.replace(token, "[REDACTED]")[:1000] if token else message[:1000])
                except (ValueError, AttributeError, TypeError):
                    pass
                attempts.append({"at": stamp, "status": error.code, "retry_after": error.headers.get("Retry-After"),
                                 "messages": messages, "rate_limit": error.headers.get("X-RateLimit-Limit"),
                                 "rate_remaining": error.headers.get("X-RateLimit-Remaining")})
                if error.code not in (500, 502, 503, 504):
                    break
            except (urllib.error.URLError, TimeoutError, OSError, ValueError):
                attempts.append({"at": stamp, "status": "transport_or_invalid_json"})
            if retry < 2:
                time.sleep(2 ** retry)
        raise RequestFailed(attempts)


class AniList:
    def __init__(self, directory):
        self.directory = Path(directory)
        self.client = Client(interval=2.1)  # <= 29/min, below the observed 30/min cap

    def fetch(self, query, variables):
        payload = {"query": query, "variables": variables}
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        path = self.directory / f"{digest}.json"
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))["response"]
        try:
            response, attempts = self.client.request("https://graphql.anilist.co", payload)
        except RequestFailed as error:
            write_json(self.directory / f"{digest}.failure.json", {"fetched_at": now(), **payload, "attempts": error.attempts})
            raise
        write_json(path, {"fetched_at": now(), "endpoint": "https://graphql.anilist.co", **payload,
                          "attempts": attempts, "response": response})
        if response.get("errors"):
            raise ValueError("AniList returned GraphQL errors; inspect cached public response")
        return response
