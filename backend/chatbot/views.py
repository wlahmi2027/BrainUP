from rest_framework.decorators import api_view
from rest_framework.response import Response

from .services.chat_engine import ask_ollama
from .loaders.knowledge_loader import search_knowledge
from API.models import Enseignant


def user_has_teacher_access(user):
    """
    Vérifie si l'utilisateur courant peut accéder au chatbot enseignant.
    À utiliser quand tu remettras la sécurité réelle.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return False

    user_role = getattr(user, "role", None)
    if user_role == "enseignant":
        return True

    user_email = getattr(user, "email", None)
    if user_email and Enseignant.objects.filter(email=user_email).exists():
        return True

    return False


@api_view(["POST"])
def chat(request):
    message = request.data.get("message", "").strip()
    history = request.data.get("history", [])
    role = request.data.get("role", "student").strip().lower()

    if not message:
        return Response(
            {
                "reply": "Message vide",
                "sources": [],
                "actions": [],
                "rag_results": [],
                "dynamic_context": None,
                "suggestions": [],
                "role": role,
            },
            status=400,
        )

    # À réactiver quand tu testes avec un vrai utilisateur connecté
    # if role == "teacher" and not user_has_teacher_access(request.user):
    #     return Response(
    #         {
    #             "reply": "Accès refusé au chatbot enseignant.",
    #             "sources": [],
    #             "actions": [],
    #             "rag_results": [],
    #             "dynamic_context": None,
    #             "suggestions": [],
    #             "role": role,
    #         },
    #         status=403,
    #     )

    try:
        context, sources, actions = search_knowledge(message, role=role)

        result = ask_ollama(
            question=message,
            role=role,
            context=context,
            history=history,
            user=request.user,
        )

        dynamic_context = result.get("dynamic_context")
        dynamic_used = bool(
            dynamic_context
            and dynamic_context != "Aucune donnée dynamique spécifique disponible."
        )

        if role == "teacher":
            suggestions = [
                "Comment créer un cours ?",
                "Comment ajouter une leçon ?",
                "Combien de cours ai-je ?",
            ]
        else:
            suggestions = [
                "Où trouver les cours ?",
                "Comment accéder aux quiz ?",
                "Comment modifier mon profil ?",
            ]

        return Response(
            {
                "reply": result["reply"],
                "sources": [] if dynamic_used else sources,
                "actions": [] if dynamic_used else actions,
                "rag_results": [] if dynamic_used else result.get("rag_results", []),
                "dynamic_context": dynamic_context,
                "suggestions": suggestions,
                "role": role,
            }
        )

    except Exception as e:
        return Response(
            {
                "reply": f"Erreur chatbot : {str(e)}",
                "sources": [],
                "actions": [],
                "rag_results": [],
                "dynamic_context": None,
                "suggestions": [],
                "role": role,
            },
            status=500,
        )