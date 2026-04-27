"""
Récupère le contexte pour l'IA (l'historique de conversation) + récupère des informations de la base de données
"""
import json
import pickle
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = Path(__file__).resolve().parent


def retrieve_context(query: str, role: str = "student", top_k: int = 3):
    role_dir = BASE_DIR / role

    vectorizer_path = role_dir / "vectorizer.pkl"
    matrix_path = role_dir / "matrix.pkl"
    meta_path = role_dir / "meta.json"

    if not vectorizer_path.exists() or not matrix_path.exists() or not meta_path.exists():
        return []

    with open(vectorizer_path, "rb") as f:
        vectorizer = pickle.load(f)

    with open(matrix_path, "rb") as f:
        matrix = pickle.load(f)

    with open(meta_path, "r", encoding="utf-8") as f:
        docs = json.load(f)

    query_vec = vectorizer.transform([query])
    scores = cosine_similarity(query_vec, matrix)[0]
    ranked = scores.argsort()[::-1]

    query_lower = query.lower()
    boosted = []

    for idx in ranked:
        doc = docs[idx]
        score = float(scores[idx])

        title = doc.get("title", "").lower()
        text = doc.get("text", "").lower()

        if "cours" in query_lower and "cours" in title:
            score += 0.20
        if "quiz" in query_lower and "quiz" in title:
            score += 0.20
        if "leçon" in query_lower and "leçon" in title:
            score += 0.20

        boosted.append((score, idx))

    boosted.sort(reverse=True, key=lambda x: x[0])

    results = []
    for score, idx in boosted[:top_k]:
        if score < 0.15:
            continue

        doc = docs[idx]
        results.append({
            "title": doc["title"],
            "text": doc["text"],
            "route": doc.get("route", ""),
            "score": score,
            "source_file": doc.get("source_file", "")
        })

    return results