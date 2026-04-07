from django.utils import timezone
from datetime import timedelta
from .utils import get_user_from_token

class UpdateLastOnlineMiddleware:
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