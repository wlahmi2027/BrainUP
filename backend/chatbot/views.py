from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.chat_engine import ask_ollama
from .loaders.knowledge_loader import search_knowledge


@api_view(["POST"])
def chat(request):
    message = request.data.get("message", "").strip()
    history = request.data.get("history", [])

    if not message:
        return Response({"reply": "Message vide", "sources": [], "actions": []}, status=400)

    try:
        context, sources, actions = search_knowledge(message)
        reply = ask_ollama(message, context=context, history=history)

        suggestions = [
            "Où trouver les cours ?",
            "Comment accéder aux quiz ?",
            "Comment modifier mon profil ?",
        ]

        return Response({
            "reply": reply,
            "sources": sources,
            "actions": actions,
            "suggestions": suggestions,
        })

    except Exception as e:
        return Response({
            "reply": f"Erreur chatbot : {str(e)}",
            "sources": [],
            "actions": [],
            "suggestions": [],
        }, status=500)