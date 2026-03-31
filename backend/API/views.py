from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny

from API.serializers import EtudiantSerializer, CoursSerializer, QuizSerializer, StudentCourseSerializer, LeconSerializer
from .models import Utilisateur, Etudiant, Enseignant, Cours, Quiz, Inscription, Lecon
from .recommendation_service import build_recommendations_payload

import secrets

from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from django.db.models import Prefetch


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


class CoursViewSet(viewsets.ModelViewSet):
    serializer_class = CoursSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)  # returns Utilisateur

        if not user:
            return Cours.objects.none()

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Cours.objects.none()  # user is authenticated but not a teacher

        return Cours.objects.filter(enseignant=enseignant)

    def list(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().list(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return {
            **context,
            "request": self.request,
        }

    def update(self, request, *args, **kwargs):
        user = get_user_from_token(request)
        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Response({"message": "Forbidden"}, status=403)

        course = self.get_object()
        if course.enseignant != enseignant:
            return Response({"message": "Forbidden"}, status=403)

        data = request.data.copy()  # <-- make a mutable copy
        if "banniere" not in request.FILES:
            data.pop("banniere", None)

        serializer = self.get_serializer(course, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=200)


    def create(self, request, *args, **kwargs):
        user = get_user_from_token(request)
        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Response({"message": "Forbidden"}, status=403)

        data = request.data.copy()  # <-- important!
        if "temps_apprentissage" not in data:
            data["temps_apprentissage"] = 0

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(enseignant=enseignant)
        return Response(serializer.data, status=201)


    def retrieve(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().retrieve(request, *args, **kwargs)


    @action(detail=True, methods=["get"], url_path="etudiants")
    def etudiants(self, request, pk=None):
        course = self.get_object()

        inscriptions = Inscription.objects.filter(cours=course).select_related("etudiant")

        data = [
            {
                "id": insc.etudiant.id,
                "username": insc.etudiant.utilisateur_ptr.nom,
                "email": insc.etudiant.utilisateur_ptr.email,
                "progression": insc.progression,
            }
            for insc in inscriptions
        ]

        return Response({
            "count": inscriptions.count(),
            "students": data
        })
    

    @action(detail=False, methods=["get"], url_path="all-etudiants")
    def all_etudiants(self, request):
        user = get_user_from_token(request)

        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Response({"message": "Forbidden"}, status=403)

        # Get all courses of this teacher
        courses = Cours.objects.filter(enseignant=enseignant)

        # Get all inscriptions linked to those courses
        inscriptions = (
            Inscription.objects
            .filter(cours__in=courses)
            .select_related("etudiant", "cours", "etudiant__utilisateur_ptr")
        )

        data = [
            {
                "id": insc.etudiant.id,
                "name": insc.etudiant.utilisateur_ptr.nom,
                "email": insc.etudiant.utilisateur_ptr.email,
                "course": insc.cours.title,
                "progress": insc.progression,
                "status": (
                    "Excellent" if insc.progression >= 80 else
                    "À relancer" if insc.progression < 40 else
                    "Actif"
                ),
            }
            for insc in inscriptions
        ]

        return Response({
            "count": inscriptions.count(),
            "students": data
        })

    def destroy(self, request, *args, **kwargs):
        user = get_user_from_token(request)
        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Response({"message": "Forbidden"}, status=403)

        course = self.get_object()
        if course.enseignant != enseignant:
            return Response({"message": "Forbidden"}, status=403)

        course.delete()
        return Response({"message": "Cours supprimé"}, status=204)


class AdminCoursViewSet(viewsets.ModelViewSet):
    serializer_class = CoursSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)

        if not user:
            return Cours.objects.none()

        if user.role == "admin":
            return Cours.objects.all()

        return Cours.objects.none()


    def list(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().list(request, *args, **kwargs)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return {
            **context,
            "request": self.request,
        }

    def update(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        if user.role != "admin":
            return Response({"message": "Forbidden"}, status=403)

        course = self.get_object()

        data = request.data.copy()
        if "banniere" not in request.FILES:
            data.pop("banniere", None)

        serializer = self.get_serializer(course, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=200)

    def retrieve(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return super().retrieve(request, *args, **kwargs)


    @action(detail=True, methods=["get"], url_path="etudiants")
    def etudiants(self, request, pk=None):
        course = self.get_object()

        inscriptions = Inscription.objects.filter(cours=course).select_related("etudiant")

        data = [
            {
                "id": insc.etudiant.id,
                "username": insc.etudiant.utilisateur_ptr.nom,
                "email": insc.etudiant.utilisateur_ptr.email,
                "progression": insc.progression,
            }
            for insc in inscriptions
        ]

        return Response({
            "count": inscriptions.count(),
            "students": data
        })
    

    @action(detail=False, methods=["get"], url_path="all-etudiants")
    def all_etudiants(self, request):
        user = get_user_from_token(request)

        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        try:
            enseignant = Enseignant.objects.get(utilisateur_ptr=user)
        except Enseignant.DoesNotExist:
            return Response({"message": "Forbidden"}, status=403)

        inscriptions = (
            Inscription.objects
            .select_related("etudiant", "cours", "etudiant__utilisateur_ptr")
        )

        # Get all inscriptions linked to those courses
        inscriptions = (
            Inscription.objects
            .filter(cours__in=courses)
            .select_related("etudiant", "cours", "etudiant__utilisateur_ptr")
        )

        data = [
            {
                "id": insc.etudiant.id,
                "name": insc.etudiant.utilisateur_ptr.nom,
                "email": insc.etudiant.utilisateur_ptr.email,
                "course": insc.cours.title,
                "progress": insc.progression,
                "status": (
                    "Excellent" if insc.progression >= 80 else
                    "À relancer" if insc.progression < 40 else
                    "Actif"
                ),
            }
            for insc in inscriptions
        ]

        return Response({
            "count": inscriptions.count(),
            "students": data
        })

    def destroy(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response({"message": "Unauthorized"}, status=401)

        if user.role != "admin":
            return Response({"message": "Forbidden"}, status=403)

        course = self.get_object()
        course.delete()

        return Response({"message": "Cours supprimé"}, status=204)




class LeconViewSet(viewsets.ModelViewSet):
    serializer_class = LeconSerializer

    def get_queryset(self):
        user = get_user_from_token(self.request)
        if not user:
            return Lecon.objects.none()

        # Only lessons of courses owned by the teacher
        return Lecon.objects.filter(cours__enseignant__utilisateur_ptr=user)

    def perform_create(self, serializer):
        user = get_user_from_token(self.request)

        if not user:
            raise PermissionDenied("Unauthorized")

        try:
            cours = Cours.objects.get(id=self.request.data.get("cours"))
        except Cours.DoesNotExist:
            raise serializers.ValidationError("Cours introuvable")

        # Ensure teacher owns the course
        if cours.enseignant.utilisateur_ptr != user:
            raise PermissionDenied("Not your course")

        serializer.save(cours=cours)

    def perform_update(self, serializer):
        user = get_user_from_token(self.request)

        if not user:
            raise PermissionDenied("Unauthorized")

        if serializer.instance.cours.enseignant.utilisateur_ptr != user:
            raise PermissionDenied("Not your course")

        serializer.save()

    def perform_destroy(self, instance):
        user = get_user_from_token(self.request)

        if not user:
            raise PermissionDenied("Unauthorized")

        if instance.cours.enseignant.utilisateur_ptr != user:
            raise PermissionDenied("Not your course")

        instance.delete()
        
class StudentCourseViewSet(viewsets.ViewSet):
    """
    List courses available to the student with their own Inscription data.
    """

    def list(self, request):
        user = get_user_from_token(request)
        if not user or user.role != "etudiant":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            student = Etudiant.objects.get(utilisateur_ptr=user)
        except Etudiant.DoesNotExist:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        # Filter only published courses
        courses = Cours.objects.filter(status="publie")

        serializer = StudentCourseSerializer(courses, many=True, context={"student": student, "request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        user = get_user_from_token(request)
        if not user or user.role != "etudiant":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            student = Etudiant.objects.get(utilisateur_ptr=user)
        except Etudiant.DoesNotExist:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            course = Cours.objects.get(pk=pk)
        except Cours.DoesNotExist:
            return Response({"detail": "Cours not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentCourseSerializer(
            course,
            context={
                "student": student,
                "request": request
            }
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="favorite")
    def favorite(self, request, pk=None):
        """
        Toggle favorite for a student on a course
        """
        user = get_user_from_token(request)
        if not user or user.role != "etudiant":
            return Response({"detail": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            student = Etudiant.objects.get(utilisateur_ptr=user)
            course = Cours.objects.get(pk=pk)
        except (Etudiant.DoesNotExist, Cours.DoesNotExist):
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        insc, created = Inscription.objects.get_or_create(etudiant=student, cours=course)
        insc.favoris = not insc.favoris
        insc.save()

        return Response({"favoris": insc.favoris}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="inscrire")
    def inscrire(self, request, pk=None):

        # 1. Get token from header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return Response(
                {"error": "No token provided"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.replace("Bearer ", "")

        # 2. Get user from token
        try:
            user = Utilisateur.objects.get(token=token)
        except Utilisateur.DoesNotExist:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 3. Check role
        if user.role != "etudiant":
            return Response(
                {"error": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 4. Get Etudiant instance
        try:
            etudiant = Etudiant.objects.get(pk=user.pk)
        except Etudiant.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Get course
        course = get_object_or_404(Cours, pk=pk)

        # 6. Create inscription
        inscription, created = Inscription.objects.get_or_create(
            etudiant=etudiant,
            cours=course
        )

        return Response({"status": "inscrit"})


    @action(detail=True, methods=["post"], url_path="desinscrire")
    def desinscrire(self, request, pk=None):

        user = get_user_from_token(request)  # your helper

        if not user or user.role != "etudiant":
            return Response({"error": "Unauthorized"}, status=403)

        course = get_object_or_404(Cours, pk=pk)

        try:
            etudiant = Etudiant.objects.get(pk=user.pk)
        except Etudiant.DoesNotExist:
            return Response({"error": "Student not found"}, status=400)

        inscriptions = Inscription.objects.filter(
            etudiant=etudiant,
            cours=course
        )

        print("FOUND:", inscriptions.count())

        deleted_count = inscriptions.delete()

        return Response({
            "status": "désinscrit",
            "deleted": deleted_count
        })


@api_view(['POST'])
def login_view(request):
    nom = request.data.get('nom')
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

        if is_admin(utilisateur):
            role = "admin"
        elif hasattr(utilisateur, "etudiant"):
            role = "etudiant"
        elif hasattr(utilisateur, "enseignant"):
            role = "enseignant"

        return Response({
            "success": True,
            "token": token,
            "user": {
                "nom": utilisateur.nom,
                "email": utilisateur.email,
                "role": role
            }
        })


    return Response(
        {"success": False, "message": "Mot de passe incorrect"},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
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

    # Vérifie que l'utilisateur connecté accède bien à ses propres recommandations
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