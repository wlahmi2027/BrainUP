import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
KB_DIR = BASE_DIR / "knowledge_base"

def load_faq():
    with open(KB_DIR / "faq.json", "r") as f:
        return json.load(f)

def load_navigation():
    with open(KB_DIR / "navigation.json", "r") as f:
        return json.load(f)

def load_courses():
    with open(KB_DIR / "courses.json", "r") as f:
        return json.load(f)