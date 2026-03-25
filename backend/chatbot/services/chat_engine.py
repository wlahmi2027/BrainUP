import requests

from chatbot.loaders.knowledge_loader import load_system_prompt
from chatbot.rag.rag_engine import retrieve_context
from chatbot.services.teacher_dynamic_service import (
    get_teacher_from_user,
    build_teacher_dynamic_context,
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "phi3:mini"


def _format_history(history):
    if not history:
        return "Aucun historique."

    lines = []
    for msg in history[-6:]:
        role = msg.get("role", "user")
        text = msg.get("text", "") or msg.get("content", "")
        lines.append(f"{role.upper()} : {text}")
    return "\n".join(lines)


def _format_rag_context(rag_results):
    if not rag_results:
        return "Aucun contexte RAG trouvé."

    blocks = []
    for item in rag_results:
        parts = [
            f"Titre: {item.get('title', '')}",
            f"Contenu: {item.get('text', '')}",
            f"Route: {item.get('route', '')}" if item.get("route") else "",
            f"Source: {item.get('source_file', '')}" if item.get("source_file") else "",
        ]
        blocks.append("\n".join(p for p in parts if p))

    return "\n\n".join(blocks)


def _clean_response(text: str) -> str:
    if not text:
        return "Je n'ai pas pu générer une réponse."

    bad_markers = [
        "Question utilisateur :",
        "Instructions :",
        "Historique récent :",
        "Contexte BrainUP structuré :",
        "Contexte BrainUP RAG :",
        "Question :",
        "Réponse finale uniquement :",
        "Réponse :",
    ]

    cleaned = text.strip()

    for marker in bad_markers:
        if marker in cleaned:
            cleaned = cleaned.split(marker)[0].strip()

    cleaned = cleaned.strip(' "\n')

    replacements = {
        "l01/": "l'",
        "l01": "l'",
        "\\/": "/",
    }

    for old, new in replacements.items():
        cleaned = cleaned.replace(old, new)

    return cleaned or "Je n'ai pas pu générer une réponse."


def ask_ollama(question, role="student", context="", history=None, user=None):
    system_prompt = load_system_prompt(role)
    history_text = _format_history(history or [])
    rag_results = retrieve_context(question, role=role, top_k=3)
    rag_context = _format_rag_context(rag_results)

    dynamic_context = "Aucune donnée dynamique spécifique disponible."

    if role == "teacher":
        teacher = get_teacher_from_user(user)
        teacher_dynamic = build_teacher_dynamic_context(question, teacher)
        if teacher_dynamic:
            dynamic_context = teacher_dynamic

    prompt = f"""
{system_prompt}

Réponds à la question en une réponse finale propre.
Ne recopie jamais les consignes.
Ne recopie jamais les sections du prompt.
N'invente aucune fonctionnalité.
N'utilise pas d'emojis.
N'utilise pas de guillemets autour de la réponse.
Utilise des phrases simples et naturelles.
Si l'information existe dans le contexte, reformule-la fidèlement.
Si le contexte dynamique contient directement la réponse, utilise-le en priorité.
Dans ce cas, donne une réponse courte, précise et fidèle au contexte dynamique.

Historique récent :
{history_text}

Contexte dynamique :
{dynamic_context}

Contexte BrainUP structuré :
{context}

Contexte BrainUP RAG :
{rag_context}

Question :
{question}

Réponse :
""".strip()

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9
            }
        },
        timeout=120
    )

    response.raise_for_status()
    data = response.json()
    raw_reply = data.get("response", "")

    return {
        "reply": _clean_response(raw_reply),
        "rag_results": rag_results,
        "dynamic_context": dynamic_context
    }