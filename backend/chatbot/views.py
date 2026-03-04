from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def chat(request):
    message = request.data.get("message")

    if not message:
        return Response({"reply": "Message vide"})

    # réponse simple pour test
    return Response({
        "reply": f"BrainUP Assistant : tu as dit '{message}'"
    })