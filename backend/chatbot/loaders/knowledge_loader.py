import json
from pathlib import Path
from typing import List, Dict, Tuple

import re


BASE_DIR = Path(__file__).resolve().parent.parent
KB_DIR = BASE_DIR / "knowledge_base"


def _read_json(role: str, filename: str):
    file_path = KB_DIR / role / filename
    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_role_files(role: str):
    role = (role or "student").lower()

    files = []
    role_dir = KB_DIR / role

    if not role_dir.exists():
        return files

    for file_path in role_dir.glob("*.json"):
        files.append((file_path.stem.capitalize(), _read_json(role, file_path.name)))

    return files


def load_system_prompt(role: str) -> str:
    prompt_path = KB_DIR / role / "system_prompt.txt"
    if not prompt_path.exists():
        return "Tu es un assistant utile."

    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def _normalize_text(value):
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(str(v) for v in value)
    if isinstance(value, dict):
        return " ".join(f"{k}: {v}" for k, v in value.items())
    return str(value)


def _tokenize(text: str):
    if not text:
        return []
    return re.findall(r"\b[\wàâçéèêëîïôûùüÿñæœ'-]+\b", text.lower())


def _score_item(question: str, item: dict) -> int:
    question_words = set(_tokenize(question))

    searchable_parts = [
        _normalize_text(item.get("title")),
        _normalize_text(item.get("name")),
        _normalize_text(item.get("question")),
        _normalize_text(item.get("answer")),
        _normalize_text(item.get("description")),
        _normalize_text(item.get("content")),
        _normalize_text(item.get("tags")),
        _normalize_text(item.get("keywords")),
        _normalize_text(item.get("route")),
    ]

    searchable_text = " ".join(searchable_parts).lower()
    score = 0

    for word in question_words:
        if len(word) >= 3 and word in searchable_text:
            score += 2

    title_or_question = " ".join([
        _normalize_text(item.get("title")),
        _normalize_text(item.get("question")),
        _normalize_text(item.get("name")),
    ]).lower()

    for word in question_words:
        if len(word) >= 3 and word in title_or_question:
            score += 3

    return score


def _format_item_for_context(item: dict, category: str) -> str:
    title = item.get("title") or item.get("name") or item.get("question") or "Information"
    route = item.get("route", "")
    description = (
        item.get("description")
        or item.get("answer")
        or item.get("content")
        or ""
    )
    tags = _normalize_text(item.get("tags") or item.get("keywords"))

    parts = [
        f"[{category}] {title}",
        f"Description: {description}" if description else "",
        f"Tags: {tags}" if tags else "",
        f"Route: {route}" if route else "",
    ]
    return "\n".join(p for p in parts if p)


def _source_from_item(item: dict, fallback_title: str = "Ressource") -> dict:
    return {
        "title": item.get("title")
        or item.get("name")
        or item.get("question")
        or fallback_title,
        "route": item.get("route", ""),
    }


def search_knowledge(question: str, role: str = "student", max_results: int = 5) -> Tuple[str, List[Dict], List[Dict]]:
    datasets = load_role_files(role)
    matches = []

    for category, items in datasets:
        if not isinstance(items, list):
            continue

        for item in items:
            if not isinstance(item, dict):
                continue

            score = _score_item(question, item)
            if score > 0:
                matches.append((score, category, item))

    matches.sort(key=lambda x: x[0], reverse=True)
    top_matches = matches[:max_results]

    if not top_matches:
        return (
            "Aucune information pertinente trouvée dans la base de connaissances.",
            [],
            []
        )

    context_blocks = []
    sources = []
    actions = []

    seen_routes = set()

    for _, category, item in top_matches:
        context_blocks.append(_format_item_for_context(item, category))
        source = _source_from_item(item, fallback_title=category)
        sources.append(source)

        route = source.get("route")
        title = source.get("title", "Ouvrir")
        if route and route not in seen_routes:
            actions.append({
                "label": f"Ouvrir {title}",
                "route": route
            })
            seen_routes.add(route)

    context = "\n\n".join(context_blocks)
    return context, sources, actions