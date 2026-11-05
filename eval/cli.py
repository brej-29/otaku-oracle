import argparse
import json
from pathlib import Path

from dotenv import load_dotenv

from .dataset import build
from .report import report
from .runner import run


def main():
    parser = argparse.ArgumentParser(description="Preregistered anime factual evaluation")
    parser.add_argument("command", choices=["build", "run", "report"])
    parser.add_argument("--data", default="eval/data")
    parser.add_argument("--output", default="eval/results/baseline-2026-11-06")
    parser.add_argument("--resume-blocked", action="store_true", help="Explicitly retry unfinished observations after resolving a credential/quota blocker")
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
    if args.command == "build":
        data = build(args.data)
        print(f"Collected {len(data['titles'])} titles, {len(data['questions'])} questions; excluded {len(data['excluded'])} fields")
        return
    dataset = json.loads((Path(args.data) / "dataset.json").read_text(encoding="utf-8"))
    if args.command == "run":
        run(dataset, args.data, args.output, resume_blocked=args.resume_blocked)
    else:
        result = report(dataset, args.output)
        print(result["interpretation"])


if __name__ == "__main__":
    main()
