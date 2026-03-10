from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status

from API.serializers import EtudiantSerializer, CoursSerializer, QuizSerializer
from .models import Utilisateur, Etudiant, Enseignant, Cours, Quiz
from .recommendation_service import build_recommendations_payload

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def progression(self, request, pk=None):
        etudiant = self.get_object()  # fetches student with this PK
        serializer = EtudiantSerializer(etudiant)
        return Response(serializer.data)


class CoursViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cours.objects.select_related("enseignant").all()
    serializer_class = CoursSerializer

    @action(detail=True, methods=["get"])
    def quizzes(self, request, pk=None):
        cours = self.get_object()
        quizzes = Quiz.objects.filter(cours=cours)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

# login check :
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')

    try:
        utilisateur = Utilisateur.objects.get(email=email)
        if utilisateur.mot_de_passe == mot_de_passe:
            return Response({"success": True, "message": "Connexion réussie"})
        else:
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


#Recommendations 
@api_view(['GET'])
def recommendations_view(request, user_id):
    try:
        etudiant = Etudiant.objects.get(id=user_id)
        payload = build_recommendations_payload(etudiant)
        return Response(payload)

    except Etudiant.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    except Exception as e:
        return Response({"error": f"Erreur serveur : {str(e)}"}, status=500)