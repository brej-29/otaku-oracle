import argparse
import json
from pathlib import Path

from dotenv import load_dotenv

from .dataset import build
from .report import report
from .runner import run
from .providers import calibrate, health


def main():
    parser = argparse.ArgumentParser(description="Preregistered anime factual evaluation")
    parser.add_argument("command", choices=["build", "health", "calibrate", "run", "report"])
    parser.add_argument("--data", default="eval/data")
    parser.add_argument("--output", default="eval/results/zai-flash-2026-11-06")
    parser.add_argument("--provider")
    parser.add_argument("--config")
    parser.add_argument("--resume-blocked", action="store_true", help="Explicitly retry unfinished observations after resolving a credential/quota blocker")
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    if args.command == "health":
        health(args.output, args.config, args.provider)
        return
    if args.command == "calibrate":
        result = calibrate(args.output, args.provider, args.config)
        if not result["passed"]:
            raise SystemExit("Calibration failed; do not start evaluation")
        return
    if args.command == "build":
        data = build(args.data)
        print(f"Collected {len(data['titles'])} titles, {len(data['questions'])} questions; excluded {len(data['excluded'])} fields")
        return
    dataset = json.loads((Path(args.data) / "dataset.json").read_text(encoding="utf-8"))
    if args.command == "run":
        run(dataset, args.data, args.output, resume_blocked=args.resume_blocked,
            provider_name=args.provider, config_path=args.config)
    else:
        result = report(dataset, args.output)
        print(result["interpretation"])


if __name__ == "__main__":
    main()
