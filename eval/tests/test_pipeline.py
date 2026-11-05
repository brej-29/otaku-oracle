import json

from eval.dataset import facts
from eval.network import AniList, Client, RequestFailed
from eval.report import interval, paired_summary, summarize
from eval.runner import prompt


def test_character_count_rejects_incomplete_pagination():
    record = {"characters": {"pageInfo": {"hasNextPage": True}, "edges": []}}
    assert facts(record)["main_characters"] is None
    record["characters"]["pageInfo"]["hasNextPage"] = False
    record["characters"]["edges"] = [{"role": "MAIN", "node": {"id": 1}}, {"role": "MAIN", "node": {"id": 1}}]
    assert facts(record)["main_characters"] == 1


def test_prompts_do_not_leak_gold():
    q = {"title": {"romaji": "Example"}, "media_id": 1, "question": "episodes?", "gold": 12345, "citation": "canonical"}
    messages = prompt(q)
    assert "12345" not in json.dumps(messages)
    assert "gold" not in json.dumps(messages)
    assert "retrieved_record" not in messages[1]["content"]
    assert "retrieved_record" in prompt(q, {"episodes": 12})[1]["content"]


def test_bootstrap_resamples_titles_as_clusters():
    rows = [{"bucket": "head", "media_id": title, "correct": correct} for title, correct in [(1, 0), (2, 1)] for _ in range(3)]
    assert interval(rows, "correct", 1000) == [0, 1]
    assert interval([], "correct") is None


def test_paired_comparison_excludes_unmatched_response_and_errors():
    rows = [dict(question_id="1:episodes", media_id=1, bucket="head", model="m", repeat=r, arm=arm,
                 status="ok", correct=arm == "B") for r in range(3) for arm in ("A", "B")]
    rows += [dict(question_id="2:episodes", media_id=2, bucket="tail", model="m", repeat=0, arm="A", status="ok", correct=True)]
    result = paired_summary(rows)
    assert result == {"pairs": 3, "questions_models": 1, "delta": 1, "ci95": [1, 1]}


def test_no_response_metrics_are_undefined():
    value = summarize([{"status": "request_error"}], 10)
    assert value["attempted"] == 1 and value["responses"] == 0 and value["coverage"] == 0
    assert value["correct"] is None and value["citation_validity"] is None


def test_cached_record_never_calls_network(tmp_path, monkeypatch):
    api = AniList(tmp_path)
    calls = []
    def request(*args):
        calls.append(args)
        return {"data": {"Media": {"id": 1}}}, []
    monkeypatch.setattr(api.client, "request", request)
    assert api.fetch("query", {"id": 1}) == api.fetch("query", {"id": 1})
    assert len(calls) == 1


def test_http_failure_redacts_credentials_and_does_not_retry_quota(monkeypatch):
    import io
    import urllib.error
    import urllib.request
    calls = []
    def fail(*args, **kwargs):
        calls.append(1)
        raise urllib.error.HTTPError("url", 429, "rate", {}, io.BytesIO(b'{"error":{"message":"secret-token"}}'))
    monkeypatch.setattr(urllib.request, "urlopen", fail)
    try:
        Client(interval=0).request("https://example.test", token="secret-token")
    except RequestFailed as error:
        assert "secret-token" not in json.dumps(error.attempts)
        assert error.attempts[0]["messages"] == ["[REDACTED]"]
    else:
        raise AssertionError("Quota failure was not raised")
    assert len(calls) == 1
