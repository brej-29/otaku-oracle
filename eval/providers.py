"""Configuration, safe diagnostics and synthetic calibration for compatible APIs."""

import hashlib
import json
import os
import tomllib
from pathlib import Path

from .network import Client, RequestFailed, now, write_json

DEFAULT_CONFIG = Path(__file__).with_name("providers.toml")


def load_providers(path=None):
    return tomllib.loads(Path(path or DEFAULT_CONFIG).read_text(encoding="utf-8"))


def resolve_provider(name=None, path=None):
    config = load_providers(path)
    name = name or os.getenv("EVAL_PROVIDER") or config["default_provider"]
    if name not in config["providers"]:
        raise ValueError("Unknown evaluation provider")
    provider = {"name": name, **config["providers"][name]}
    if not provider["base_url"].startswith("https://"):
        raise ValueError("Provider base URL must use HTTPS")
    return provider


def credentials(provider):
    token = os.getenv(provider["key_env"])
    if not token:
        raise ValueError(f"Missing credential in {provider['key_env']}; no request made")
    return token


def redact(value):
    encoded = json.dumps(value, ensure_ascii=False)
    for provider in load_providers()["providers"].values():
        token = os.getenv(provider["key_env"])
        if token:
            encoded = encoded.replace(token, "[REDACTED]")
    return json.loads(encoded)


def discover(client, directory, provider):
    if not provider.get("run_enabled"):
        raise ValueError("Provider inference disabled until free eligibility is explicitly verified in config")
    models = list(provider["models"])
    if provider["discovery"] == "zero_price_free_suffix":
        catalog, attempts = client.request(provider["base_url"].rstrip("/") + "/models")
        available = sorted(m["id"] for m in catalog["data"] if m["id"].endswith(":free")
                           and all(float(m.get("pricing", {}).get(k, -1)) == 0 for k in ("prompt", "completion")))
        models = models or available[:2]
        if any(m not in available for m in models):
            raise ValueError("Selected models are not zero-price free catalog entries")
        write_json(Path(directory) / "catalog.json", {"fetched_at": now(), "attempts": attempts,
            "full_catalog_sha256": hashlib.sha256(json.dumps(catalog, sort_keys=True).encode()).hexdigest(),
            "hash_basis": "sorted-key JSON response encoded as UTF-8",
            "response": {"data": [m for m in catalog["data"] if m["id"] in models]}})
    elif any(m not in provider["free_models"] for m in models):
        raise ValueError("Selected model is not on the explicitly verified free allowlist")
    if len(models) != 2 or len(set(models)) != 2:
        raise ValueError("Evaluation requires exactly two distinct free model IDs")
    return models


def health(directory, path=None, selected=None):
    config = load_providers(path)
    results = []
    for name, settings in config["providers"].items():
        if selected and name != selected:
            continue
        provider = {"name": name, **settings}
        row = {"provider": name, "checked_at": now(), "inference_enabled": settings["run_enabled"],
               "notes": settings["free_tier_notes"], "scope": "authenticated GET only; does not establish chat quota"}
        token = os.getenv(settings["key_env"])
        if not token:
            row["status"] = "missing_credential"
        else:
            try:
                _, attempts = Client().request(settings["base_url"] + settings["health_path"], token=token)
                row.update(status="authenticated", attempts=attempts)
            except RequestFailed as error:
                row.update(status="request_error", attempts=error.attempts)
        results.append(redact(row))
    write_json(Path(directory) / "health.json", results)
    for row in results:
        code = row.get("attempts", [{}])[-1].get("status", "none")
        print(f"{row['provider']}: {row['status']} ({code}); chat quota not inferred")
    return results


def calibrate(directory, provider_name=None, path=None):
    """Three fixed synthetic JSON checks per model, never dataset questions."""
    from .runner import SYSTEM
    provider = resolve_provider(provider_name, path)
    token = credentials(provider)
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    if (directory / "calibration.json").exists():
        raise FileExistsError("Calibration already archived; do not overwrite or tune against results")
    client = Client(interval=provider["interval"], retry_rate_limits=True)
    models = discover(client, directory, provider)
    rows = []
    for model in models:
        for answer in (7, 19, 42):
            payload = {"model": model, "temperature": .2, "max_tokens": 256,
                "messages": [{"role": "system", "content": SYSTEM},
                             {"role": "user", "content": f'Return only JSON with answer equal to integer {answer}, confidence equal to 1, and citations equal to an empty list.'}],
                **provider["request_options"]}
            try:
                response, attempts = client.request(provider["base_url"] + "/chat/completions", payload, token)
                choices = response.get("choices") or [{}]
                content = choices[0].get("message", {}).get("content")
                try:
                    passed = json.loads(content) == {"answer": answer, "confidence": 1, "citations": []}
                except (ValueError, TypeError):
                    passed = False
                rows.append({"model": model, "served_model": response.get("model"), "payload": payload,
                    "content": content, "passed": passed, "attempts": attempts, "usage": response.get("usage"),
                    "finish_reason": choices[0].get("finish_reason")})
            except RequestFailed as error:
                rows.append({"model": model, "payload": payload, "passed": False, "attempts": error.attempts})
                break
    result = redact({"at": now(), "provider": provider, "purpose": "non-dataset output transport calibration",
                     "passed": len(rows) == 6 and all(r["passed"] for r in rows), "checks": rows})
    write_json(directory / "calibration.json", result)
    print(f"Calibration: {sum(r['passed'] for r in rows)}/{len(rows)} passed; ready={result['passed']}")
    return result


def calibration_assessment(result):
    """Separate output-format validation from a provider's transient availability."""
    checks = result["checks"]
    models = result["provider"]["models"]
    responses = [r for r in checks if r.get("content") is not None]
    ready = all(any(r["model"] == m and r["passed"] for r in responses) for m in models)
    return {"format_ready": ready and all(r["passed"] for r in responses),
            "all_six_checks_passed": result["passed"], "valid_final_answers": sum(r["passed"] for r in checks),
            "checks_recorded": len(checks), "availability_failures": sum(r.get("content") is None for r in checks),
            "note": "All returned final answers must match the schema and every model must demonstrate one; availability failures remain failures, not successful checks"}
