import json
import pickle
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = Path(__file__).resolve().parent
KB_DIR = BASE_DIR.parent / "knowledge_base"
ROLES = ["student", "teacher"]


def build_docs_for_role(role: str):
    role_dir = KB_DIR / role
    docs = []

    if not role_dir.exists():
        return docs

    for json_file in role_dir.glob("*.json"):
        with open(json_file, "r", encoding="utf-8") as f:
            items = json.load(f)

        if not isinstance(items, list):
            continue

        for item in items:
            if not isinstance(item, dict):
                continue

            title = item.get("title") or item.get("name") or item.get("question") or "Information"
            text = (
                item.get("text")
                or item.get("answer")
                or item.get("description")
                or item.get("content")
                or ""
            )
            route = item.get("route", "")

            docs.append({
                "title": title,
                "text": text,
                "route": route,
                "source_file": json_file.name
            })

    return docs


def build_index_for_role(role: str):
    docs = build_docs_for_role(role)

    if not docs:
        print(f"Aucun document trouvé pour {role}")
        return

    texts = [f"{doc['title']} {doc['text']}" for doc in docs]

    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(texts)

    role_output_dir = BASE_DIR / role
    role_output_dir.mkdir(parents=True, exist_ok=True)

    with open(role_output_dir / "vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)

    with open(role_output_dir / "matrix.pkl", "wb") as f:
        pickle.dump(matrix, f)

    with open(role_output_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

    print(f"Index TF-IDF créé avec succès pour {role}")


if __name__ == "__main__":
    for role in ROLES:
        build_index_for_role(role)