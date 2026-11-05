"""Collect a fixed stratified sample before observing model answers."""

import hashlib
import json
import random
from pathlib import Path

from .network import AniList, now, write_json

SEED = 20261106
FIELDS = """
id title { romaji english native } siteUrl popularity episodes startDate { year }
format source season status isAdult
studios(isMain: true) { nodes { id name } }
characters(role: MAIN, perPage: 50) { pageInfo { hasNextPage } edges { role node { id } } }
"""
PAGE_QUERY = """query($page:Int!) {
Page(page:$page, perPage:50) {
media(type:ANIME, status:FINISHED, isAdult:false, sort:[POPULARITY_DESC,ID]) {
""" + FIELDS + "\n} } }"
RECORD_QUERY = "query($id:Int!) { Media(id:$id, type:ANIME) { " + FIELDS + " } }"
TEMPLATES = {
    "studio": "Which main animation studio or studios are listed for this anime? Return a list of studio names.",
    "episodes": "How many episodes does this anime have? Return an integer.",
    "year": "In which year did this anime start? Return a four-digit integer.",
    "format": "What is its AniList format? Return the enum (TV, TV_SHORT, MOVIE, SPECIAL, OVA, ONA, MUSIC, or MANGA).",
    "source": "What is its source material? Return the AniList source enum, such as ORIGINAL, MANGA, LIGHT_NOVEL, VISUAL_NOVEL, VIDEO_GAME, or OTHER.",
    "season": "In which season did it start? Return WINTER, SPRING, SUMMER, or FALL.",
    "main_characters": "How many character edges are labelled MAIN in this anime's AniList record? Return an integer.",
}


def facts(record):
    chars = record.get("characters") or {}
    studios = (record.get("studios") or {}).get("nodes", [])
    return {
        "studio": sorted({s["name"] for s in studios}) or None,
        "episodes": record.get("episodes"),
        "year": (record.get("startDate") or {}).get("year"),
        "format": record.get("format"), "source": record.get("source"), "season": record.get("season"),
        "main_characters": (len({e["node"]["id"] for e in chars["edges"] if e["role"] == "MAIN"})
                            if "edges" in chars and not chars["pageInfo"]["hasNextPage"] else None),
    }


def fingerprint(dataset):
    return hashlib.sha256(json.dumps(dataset, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def build(directory):
    directory = Path(directory)
    target = directory / "dataset.json"
    if target.exists():
        raise FileExistsError("Snapshot already exists; use a different --data directory to collect again")
    api = AniList(directory / "raw")
    rng = random.Random(SEED)
    titles, questions, excluded = [], [], []
    for bucket, page in (("head", 1), ("torso", 11), ("long_tail", 91)):
        candidates = api.fetch(PAGE_QUERY, {"page": page})["data"]["Page"]["media"]
        # Pick before examining fact completeness; do not replace missing fields.
        selected = rng.sample(candidates, min(6, len(candidates)))
        for record in selected:
            title = {"bucket": bucket, "record": record}
            titles.append(title)
            for kind, gold in facts(record).items():
                if gold is None:
                    excluded.append({"media_id": record["id"], "kind": kind, "reason": "missing_or_incomplete"})
                    continue
                questions.append({"id": f"{record['id']}:{kind}", "media_id": record["id"],
                                  "bucket": bucket, "kind": kind, "title": record["title"],
                                  "question": TEMPLATES[kind], "gold": gold,
                                  "citation": f"https://anilist.co/anime/{record['id']}"})
    dataset = {"schema": 1, "created_at": now(), "seed": SEED, "titles": titles,
               "questions": questions, "excluded": excluded,
               "rank_population": "FINISHED, non-adult ANIME sorted by popularity descending, then ID ascending"}
    write_json(target, dataset)
    return dataset
