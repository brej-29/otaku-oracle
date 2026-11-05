import io
import json
import urllib.error

import pytest

from eval.network import Client, RequestFailed, retry_delay
from eval.providers import calibration_assessment, discover, redact, resolve_provider


def test_billing_error_stops_without_retry(monkeypatch):
    calls = []
    def fail(*args, **kwargs):
        calls.append(1)
        raise urllib.error.HTTPError("url", 429, "billing", {}, io.BytesIO(b'{"error":{"code":"1113","message":"Insufficient balance"}}'))
    monkeypatch.setattr("urllib.request.urlopen", fail)
    with pytest.raises(RequestFailed) as error:
        Client(interval=0, retry_rate_limits=True).request("https://example.test")
    assert len(calls) == 1 and error.value.attempts[0]["codes"] == ["1113"]


def test_transient_429_honors_retry_after_and_bounds_attempts(monkeypatch):
    calls, sleeps = [], []
    def fail(*args, **kwargs):
        calls.append(1)
        raise urllib.error.HTTPError("url", 429, "busy", {"Retry-After": "65"}, io.BytesIO(b'{"error":{"code":"1305","message":"Overloaded"}}'))
    monkeypatch.setattr("urllib.request.urlopen", fail)
    monkeypatch.setattr("time.sleep", sleeps.append)
    with pytest.raises(RequestFailed) as error:
        Client(interval=0, retry_rate_limits=True).request("https://example.test")
    assert len(calls) == 3 and len(error.value.attempts) == 3
    assert sleeps.count(65) == 2


def test_retry_after_formats():
    assert retry_delay("12") == 12
    assert retry_delay("bad") is None
    assert retry_delay("Wed, 21 Oct 2015 07:28:00 GMT") == 0


def test_free_allowlist_rejects_paid_configuration(tmp_path):
    provider = resolve_provider("zai")
    assert discover(None, tmp_path, provider) == provider["models"]
    provider["models"] = ["not-verified-free", provider["models"][0]]
    with pytest.raises(ValueError, match="free allowlist"):
        discover(None, tmp_path, provider)
    with pytest.raises(ValueError, match="disabled"):
        discover(None, tmp_path, resolve_provider("mistral"))


def test_catalog_snapshot_contains_only_selected_entries(tmp_path):
    class FakeClient:
        def request(self, *args):
            return {"data": [{"id": f"{name}:free", "pricing": {"prompt": "0", "completion": "0"}}
                              for name in ("a", "b", "c")]}, []
    selected = discover(FakeClient(), tmp_path, resolve_provider("openrouter"))
    snapshot = json.loads((tmp_path / "catalog.json").read_text())
    assert selected == ["a:free", "b:free"]
    assert len(snapshot["response"]["data"]) == 2 and len(snapshot["full_catalog_sha256"]) == 64


def test_redaction_covers_all_configured_credentials(monkeypatch):
    monkeypatch.setenv("Z_API_KEY", "fake-private-token-one")
    monkeypatch.setenv("GROQ_API_KEY", "fake-private-token-two")
    assert redact({"message": "fake-private-token-one fake-private-token-two"}) == {"message": "[REDACTED] [REDACTED]"}


def test_calibration_distinguishes_format_from_availability():
    result = {"provider": {"models": ["one", "two"]}, "passed": False, "checks": [
        {"model": "one", "passed": True, "content": "{}"},
        {"model": "two", "passed": True, "content": "{}"},
        {"model": "one", "passed": False}]}
    assessment = calibration_assessment(result)
    assert assessment["format_ready"] and not assessment["all_six_checks_passed"]
    assert assessment["availability_failures"] == 1
    result["checks"].append({"model": "two", "passed": False, "content": "garbage"})
    assert not calibration_assessment(result)["format_ready"]
