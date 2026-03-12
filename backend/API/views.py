from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny

from API.serializers import (
    EtudiantSerializer,
    CoursSerializer,
    QuizSerializer,
    QuestionSerializer,
    ChoixQuestionSerializer,
)
from .models import Utilisateur, Etudiant, Enseignant, Cours, Quiz, Question, ChoixQuestion
from .recommendation_service import build_recommendations_payload

import secrets

from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    token = parts[1]

    try:
        return Utilisateur.objects.get(token=token)
    except Utilisateur.DoesNotExist:
        return None


@api_view(['GET'])
def profil_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        "nom": user.nom,
        "email": user.email
    })


@api_view(['POST'])
def logout_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"success": False, "message": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    user.token = None
    user.save()

    return Response(
        {"success": True, "message": "Déconnexion réussie"},
        status=status.HTTP_200_OK
    )


class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def progression(self, request, pk=None):
        etudiant = self.get_object()
        serializer = self.get_serializer(etudiant)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CoursSerializer

    def get_queryset(self):
        queryset = Cours.objects.select_related("enseignant").all()

        enseignant_id = self.request.query_params.get("enseignant")
        if enseignant_id:
            queryset = queryset.filter(enseignant_id=enseignant_id)

        return queryset.order_by("id")

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        cours = self.get_object()
        quizzes = Quiz.objects.filter(cours=cours).select_related("cours", "enseignant")
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer

    def get_queryset(self):
        queryset = (
            Quiz.objects.all()
            .select_related('cours', 'enseignant')
            .prefetch_related('questions', 'tentatives')
        )

        enseignant_id = self.request.query_params.get('enseignant')
        cours_id = self.request.query_params.get('cours')

        if enseignant_id:
            queryset = queryset.filter(enseignant_id=enseignant_id)

        if cours_id:
            queryset = queryset.filter(cours_id=cours_id)

        return queryset.order_by('-date_creation')


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = (
            Question.objects.all()
            .select_related('quiz')
            .prefetch_related('choix')
        )

        quiz_id = self.request.query_params.get('quiz')
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)

        return queryset.order_by('ordre')


class ChoixQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = ChoixQuestionSerializer

    def get_queryset(self):
        queryset = ChoixQuestion.objects.all().select_related('question')

        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)

        return queryset.order_by('ordre')


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')

    if not email or not mot_de_passe:
        return Response(
            {"success": False, "message": "Email et mot de passe sont requis"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        utilisateur = Utilisateur.objects.get(email=email)
    except Utilisateur.DoesNotExist:
        return Response(
            {"success": False, "message": "Email invalide"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if check_password(mot_de_passe, utilisateur.mot_de_passe):
        token = secrets.token_hex(32)
        utilisateur.token = token
        utilisateur.save()

        if hasattr(utilisateur, "etudiant"):
            role = "etudiant"
        elif hasattr(utilisateur, "enseignant"):
            role = "enseignant"
        else:
            role = "admin"

        return Response({
            "success": True,
            "token": token,
            "user": {
                "email": utilisateur.email,
                "role": role,
                "id": utilisateur.id,
                "nom": utilisateur.nom,
            }
        })

    return Response(
        {"success": False, "message": "Mot de passe incorrect"},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    nom = request.data.get('nom')
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')
    role = request.data.get('role', 'etudiant')

    if role:
        role = role.lower()

    if not all([nom, email, mot_de_passe, role]):
        return Response(
            {"success": False, "message": "Tous les champs sont requis"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Utilisateur.objects.filter(email=email).exists():
        return Response(
            {"success": False, "message": "Cet email est déjà utilisé"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_password(mot_de_passe)
    except ValidationError as e:
        return Response(
            {"success": False, "message": e.messages},
            status=status.HTTP_400_BAD_REQUEST
        )

    mot_de_passe_hash = make_password(mot_de_passe)

    if role == "etudiant":
        Etudiant.objects.create(
            nom=nom,
            email=email,
            mot_de_passe=mot_de_passe_hash,
            progression=0.0,
            score_moyen=0.0
        )
    elif role == "enseignant":
        Enseignant.objects.create(
            nom=nom,
            email=email,
            mot_de_passe=mot_de_passe_hash,
            specialite=""
        )
    else:
        return Response(
            {"success": False, "message": "Rôle invalide"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {"success": True, "message": "Inscription réussie"},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
def recommendations_view(request, user_id):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        etudiant = Etudiant.objects.get(id=user_id)
    except Etudiant.DoesNotExist:
        return Response(
            {"error": "Étudiant introuvable"},
            status=status.HTTP_404_NOT_FOUND
        )

    if user.id != etudiant.id:
        return Response(
            {"error": "Accès interdit"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        payload = build_recommendations_payload(etudiant)
        return Response(payload, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Erreur serveur : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )