import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "phi3:mini"

SYSTEM_PROMPT = """
Tu es BrainUP Assistant, un assistant pédagogique pour une plateforme e-learning.

Tes missions :
- répondre aux questions fréquentes,
- aider à naviguer sur le site,
- orienter vers les bons cours,
- répondre de façon claire, courte et utile.

Règles importantes :
- Réponds toujours en français.
- Utilise d'abord le contexte BrainUP fourni.
- N'invente jamais de pages, routes, emails, boutons ou fonctionnalités.
- Si l'information n'est pas dans le contexte, dis-le honnêtement.
- Si une route existe dans le contexte, cite-la clairement.
- Sois concret, utile, et évite les réponses trop générales.
"""

def _format_history(history):
    if not history:
        return "Aucun historique."

    lines = []
    for msg in history[-6:]:
        role = msg.get("role", "user")
        text = msg.get("text", "")
        lines.append(f"{role.upper()} : {text}")
    return "\n".join(lines)


def ask_ollama(question, context="", history=None):
    history_text = _format_history(history or [])

    prompt = f"""
{SYSTEM_PROMPT}

Historique récent :
{history_text}

Contexte BrainUP :
{context}

Question utilisateur :
{question}

Réponse attendue :
- courte à moyenne
- précise
- utile
- basée sur BrainUP si possible
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )

    response.raise_for_status()
    data = response.json()
    return data.get("response", "Je n'ai pas pu générer une réponse.")