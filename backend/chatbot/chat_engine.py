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

Règles :
- Réponds toujours en français.
- Utilise uniquement le contexte fourni si possible.
- Si l'information n'est pas dans le contexte, dis-le honnêtement.
- Si une route est présente, tu peux proposer à l'utilisateur d'y aller.
"""

def ask_ollama(question, context=""):
    prompt = f"""
{SYSTEM_PROMPT}

Contexte :
{context}

Question utilisateur :
{question}

Réponse :
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