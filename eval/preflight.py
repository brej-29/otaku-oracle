"""Prepare isolated extension caches serially and measure grounded prompt sizes."""

import hashlib
import json
from pathlib import Path

from .dataset import RECORD_QUERY, facts, fingerprint
from .network import AniList, now, write_json
from .pacing import input_bound
from .providers import payload_for, resolve_provider
from .runner import prompt


def prepare(data_directory="eval/data", outputs=None):
    outputs = outputs or {"groq": "eval/results/replication-groq-2026-11-06",
                          "nvidia": "eval/results/replication-nvidia-2026-11-06"}
    data_directory = Path(data_directory)
    dataset = json.loads((data_directory / "dataset.json").read_text(encoding="utf-8"))
    api = AniList(Path(next(iter(outputs.values()))) / "retrieval")
    api.client.interval = 3.1  # <=20/min plus the primary's infrequent cache misses
    records = {}
    for title in dataset["titles"]:
        expected = title["record"]
        payload = {"query": RECORD_QUERY, "variables": {"id": expected["id"]}}
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        source = data_directory / "retrieval" / f"{digest}.json"
        # Read existing cache only; never write into the primary cache.
        if source.exists():
            snapshot = json.loads(source.read_text(encoding="utf-8"))
            write_json(api.directory / source.name, snapshot)
            record = snapshot["response"]["data"]["Media"]
        else:
            record = api.fetch(RECORD_QUERY, {"id": expected["id"]})["data"]["Media"]
        if facts(record) != facts(expected):
            raise ValueError("Retrieval facts drifted from dataset; do not start extensions")
        records[expected["id"]] = record
        for output in outputs.values():
            target = Path(output) / "retrieval" / f"{digest}.json"
            if target != api.directory / f"{digest}.json":
                write_json(target, json.loads((api.directory / f"{digest}.json").read_text(encoding="utf-8")))
    for name, output in outputs.items():
        provider = resolve_provider(name)
        sizes = []
        for question in dataset["questions"]:
            messages = prompt(question, records[question["media_id"]])
            payload = payload_for(provider, provider["models"][0], messages)
            sizes.append({"question_id": question["id"], "input_utf8_bytes": len(json.dumps(messages, ensure_ascii=False).encode("utf-8")),
                          "conservative_input_tokens": input_bound(payload), "reserved_completion_tokens": provider.get("max_tokens", 256)})
        write_json(Path(output) / "prompt-sizes.json", {"at": now(), "dataset_sha256": fingerprint(dataset),
            "method": "exact UTF-8 byte lengths plus 256 framing-token reserve, not a provider tokenizer; actual prompt tokens logged from response usage",
            "grounded_min_byte_length": min(s["input_utf8_bytes"] for s in sizes),
            "grounded_max_byte_length": max(s["input_utf8_bytes"] for s in sizes), "questions": sizes})
        print(f"{name}: isolated cache ready; grounded byte lengths {min(s['input_utf8_bytes'] for s in sizes)}..{max(s['input_utf8_bytes'] for s in sizes)}", flush=True)


if __name__ == "__main__":
    prepare()
