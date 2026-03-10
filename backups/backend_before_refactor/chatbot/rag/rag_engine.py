import os
import json
import pickle
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(__file__)

VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")
MATRIX_PATH = os.path.join(BASE_DIR, "matrix.pkl")
META_PATH = os.path.join(BASE_DIR, "meta.json")

with open(VECTORIZER_PATH, "rb") as f:
    vectorizer = pickle.load(f)

with open(MATRIX_PATH, "rb") as f:
    matrix = pickle.load(f)

with open(META_PATH, "r", encoding="utf-8") as f:
    docs = json.load(f)


def retrieve_context(query, top_k=3):

    query_vec = vectorizer.transform([query])

    scores = cosine_similarity(query_vec, matrix)[0]

    ranked = scores.argsort()[::-1][:top_k]

    results = []

    for idx in ranked:
        doc = docs[idx]

        results.append({
            "title": doc["title"],
            "text": doc["text"],
            "route": doc.get("route", ""),
            "score": float(scores[idx])
        })

    return results