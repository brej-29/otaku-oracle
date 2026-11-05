import json

import pytest

from eval.dataset import fingerprint
from eval.network import Client, RequestFailed
from eval.pacing import Budget, input_bound
from eval.providers import credentials, discover, payload_for


def dummy(role="exploratory_replication"):
    return {"name": "dummy", "base_url": "https://example.invalid/v1", "key_env": "DUMMY_KEY",
            "key_env_fallbacks": ["DUMMY_TYPO_KEY"], "models": ["dummy-model"], "free_models": ["dummy-model"],
            "run_enabled": True, "analysis_role": role, "discovery": "configured", "interval": 0,
            "max_tokens": 1024, "token_parameter": "max_completion_tokens", "request_options": {"reasoning_effort": "low"}}


def test_key_fallback_preserves_priority(monkeypatch):
    monkeypatch.delenv("DUMMY_KEY", raising=False)
    monkeypatch.setenv("DUMMY_TYPO_KEY", "typo-value")
    assert credentials(dummy()) == "typo-value"
    monkeypatch.setenv("DUMMY_KEY", "correct-value")
    assert credentials(dummy()) == "correct-value"


def test_one_model_allowed_only_for_replication(tmp_path):
    assert discover(None, tmp_path, dummy()) == ["dummy-model"]
    with pytest.raises(ValueError):
        discover(None, tmp_path, dummy("registered_primary"))


def test_reasoning_budget_uses_only_configured_parameter():
    payload = payload_for(dummy(), "dummy-model", [])
    assert payload["max_completion_tokens"] == 1024 and "max_tokens" not in payload


def test_daily_budget_survives_resume(tmp_path):
    provider = {"quota_ledger": str(tmp_path / "ledger.json"), "minute_tokens": 8000,
                "minute_requests": 25, "daily_tokens": 10000, "daily_requests": 1}
    payload = {"messages": [], "max_tokens": 256}
    budget = Budget(provider)
    budget.before(payload)
    budget.after({"usage": {"prompt_tokens": 4, "total_tokens": 20}}, {"status": 200})
    assert json.loads((tmp_path / "ledger.json").read_text())[0]["tokens"] == 20
    with pytest.raises(RequestFailed):
        Budget(provider).before(payload)
    assert input_bound(payload) >= 256


def test_account_identifiers_are_not_retained(monkeypatch):
    import io
    import urllib.error
    def fail(*args, **kwargs):
        raise urllib.error.HTTPError("url", 429, "limited", {}, io.BytesIO(b'{"error":{"code":"quota","message":"Account acct-private-123 limited"}}'))
    monkeypatch.setattr("urllib.request.urlopen", fail)
    with pytest.raises(RequestFailed) as error:
        Client(interval=0, suppress_messages=True).request("https://example.invalid")
    assert "acct-private" not in json.dumps(error.value.attempts)


def test_completed_replication_never_evaluates_primary_threshold(tmp_path, monkeypatch):
    from eval.runner import run
    from eval.report import report
    import eval.runner as runner
    provider = dummy()
    monkeypatch.setenv("DUMMY_KEY", "dummy-credential")
    monkeypatch.setattr(runner, "resolve_provider", lambda *a: provider)
    record = {"id": 1, "season": "SPRING", "title": {"romaji": "Dummy"}}
    q = {"id": "1:season", "media_id": 1, "bucket": "head", "kind": "season", "title": record["title"],
         "question": "season?", "gold": "SPRING", "citation": "https://anilist.co/anime/1"}
    dataset = {"titles": [{"record": record}], "questions": [q]}
    monkeypatch.setattr(runner.AniList, "fetch", lambda *a: {"data": {"Media": record}})
    def respond(self, url, payload=None, token=None):
        return {"model": "dummy-model", "choices": [{"message": {"content": '{"answer":"SPRING","confidence":1,"citations":[]}'}}]}, []
    monkeypatch.setattr(Client, "request", respond)
    run(dataset, tmp_path, tmp_path / "extension")
    result = report(dataset, tmp_path / "extension")
    assert result["completion"]["complete"] and "threshold" not in result
    assert result["analysis_role"] == "exploratory_replication"
    manifest = json.loads((tmp_path / "extension/manifest.json").read_text())
    assert manifest["dataset_sha256"] == fingerprint(dataset) and manifest["expected_model_calls"] == 6
