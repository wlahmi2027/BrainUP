from API.models import Utilisateur

def get_user_from_token(request):

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]
        user = Utilisateur.objects.get(token=token)
        return user
    except:
        return None
        
def is_admin(user):
    return user and user.role == "admin"

def get_serializer_context(self):
    return {
        "request": self.request
    }