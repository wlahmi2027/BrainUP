import json
import os
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = os.path.dirname(__file__)
KB_PATH = os.path.join(BASE_DIR, "kb.json")

VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")
MATRIX_PATH = os.path.join(BASE_DIR, "matrix.pkl")
META_PATH = os.path.join(BASE_DIR, "meta.json")


with open(KB_PATH, "r", encoding="utf-8") as f:
    docs = json.load(f)

texts = [doc["title"] + " " + doc["text"] for doc in docs]

vectorizer = TfidfVectorizer()
matrix = vectorizer.fit_transform(texts)

with open(VECTORIZER_PATH, "wb") as f:
    pickle.dump(vectorizer, f)

with open(MATRIX_PATH, "wb") as f:
    pickle.dump(matrix, f)

with open(META_PATH, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=2)

print("Index TF-IDF créé avec succès")