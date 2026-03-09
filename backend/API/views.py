from rest_framework import viewsets
from rest_framework.response import Response

from API.serializers import EtudiantSerializer
from rest_framework.decorators import action

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from rest_framework.permissions import AllowAny

from rest_framework.decorators import api_view, permission_classes

from .models import Utilisateur, Etudiant, Enseignant
import secrets

@api_view(['GET'])
def profil_view(request):

    user = get_user_from_token(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=401)

    return Response({
        "nom": user.nom,
        "email": user.email
    })

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


@api_view(['POST'])
def logout_view(request):

    user = get_user_from_token(request)

    if not user:
        return Response({"success": False}, status=401)

    user.token = None
    user.save()

    return Response({"success": True})


class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def progression(self, request, pk=None):
        etudiant = self.get_object()  # fetches student with this PK
        serializer = EtudiantSerializer(etudiant)
        return Response(serializer.data)


# login check :
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')

    try:
        utilisateur = Utilisateur.objects.get(email=email)

        if utilisateur.mot_de_passe == mot_de_passe:
            token = secrets.token_hex(32)
            utilisateur.token = token
            utilisateur.save()

            return Response({
                "success": True,
                "token": token,
                "user": utilisateur.email
            })

        return Response({"success": False, "message": "Mot de passe incorrect"}, status=401)

    except Utilisateur.DoesNotExist:
        return Response({"success": False, "message": "Email invalide"}, status=401)

# sign up post :
@permission_classes([AllowAny])
@api_view(['POST'])
def register_view(request):
    nom = request.data.get('nom')
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')
    role = request.data.get('role', 'etudiant').lower()  # default to etudiant

    if not all([nom, email, mot_de_passe, role]):
        return Response({"success": False, "message": "Tous les champs sont requis"}, status=400)

    # Check if email already exists in Utilisateur table
    if Utilisateur.objects.filter(email=email).exists():
        return Response({"success": False, "message": "Cet email est déjà utilisé"}, status=400)

    # Create child instance directly
    if role == "etudiant":
        Etudiant.objects.create(
            nom=nom,
            email=email,
            mot_de_passe=mot_de_passe,
            progression=0.0,
            score_moyen=0.0
        )
    elif role == "enseignant":
        Enseignant.objects.create(
            nom=nom,
            email=email,
            mot_de_passe=mot_de_passe,
            specialite=""
        )
    else:
        return Response({"success": False, "message": "Rôle invalide"}, status=400)

    return Response({"success": True, "message": "Inscription réussie"})