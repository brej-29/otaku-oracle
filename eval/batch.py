"""Background entry point: hold a writer lock and generate a report on exit."""

import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv

from .network import now, write_json
from .providers import calibration_assessment, resolve_provider
from .report import report
from .runner import run


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="eval/results/zai-flash-2026-11-06")
    parser.add_argument("--data", default="eval/data")
    parser.add_argument("--provider", default="zai")
    parser.add_argument("--calibration", default="eval/results/calibration-json-zai-2026-11-06/calibration.json")
    parser.add_argument("--resume-blocked", action="store_true")
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    calibration = json.loads(Path(args.calibration).read_text(encoding="utf-8"))
    provider = resolve_provider(args.provider)
    assessment = calibration_assessment(calibration)
    if not assessment["format_ready"] or calibration["provider"] != provider:
        raise SystemExit("Final-answer format must be validated for the exact current provider configuration")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    write_json(output / "calibration-assessment.json", assessment)
    # OS releases the advisory lock even if the process crashes; stale files are harmless.
    with (output / ".run.lock").open("a+b") as lock:
        lock.seek(0)
        if os.name == "nt":
            import msvcrt
            if not lock.read(1):
                lock.write(b"0")
                lock.flush()
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        write_json(output / "process.json", {"pid": os.getpid(), "started_at": now(), "provider": args.provider,
                   "calibration": args.calibration, "state": "running"})
        dataset = json.loads((Path(args.data) / "dataset.json").read_text(encoding="utf-8"))
        try:
            run(dataset, args.data, output, provider_name=args.provider, resume_blocked=args.resume_blocked)
        finally:
            if (output / "answers.jsonl").exists():
                result = report(dataset, output)
                print(result["interpretation"], flush=True)
            write_json(output / "process.json", {"pid": os.getpid(), "finished_at": now(), "provider": args.provider,
                       "calibration": args.calibration, "state": "exited"})


if __name__ == "__main__":
    main()
