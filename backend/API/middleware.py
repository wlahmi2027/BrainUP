from django.utils import timezone
from datetime import timedelta
from .utils import get_user_from_token

"""
Middleware gère les fonctions entre urls.py et views.py.
Ici, elle n'est que utilisé pour mettre a jour la valeur last_online des utilisateurs
"""


class UpdateLastOnlineMiddleware:
    """
    Middleware Django qui met à jour le champ `last_online` de l'utilisateur
    à chaque requête backend, si la dernière mise à jour date de plus de 5 min.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = get_user_from_token(request)
        if user:
            now = timezone.now()
            if not user.last_online or (now - user.last_online) > timedelta(minutes=5):
                user.last_online = now
                user.save(update_fields=["last_online"])
        response = self.get_response(request)
        return response