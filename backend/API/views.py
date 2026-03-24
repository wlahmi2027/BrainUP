from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django.db.models import Avg, Sum, Count, Max, Q
from django.utils import timezone

from API.serializers import (
    EtudiantSerializer,
    CoursSerializer,
    QuizSerializer,
    QuestionSerializer,
    ChoixQuestionSerializer,
    StudentQuizSerializer,
    TeacherQuizResultSerializer,
    QuizSubmissionResponseSerializer,
    StudentCourseSerializer,
)
from .models import (
    Utilisateur,
    Etudiant,
    Enseignant,
    Cours,
    Quiz,
    Question,
    ChoixQuestion,
    TentativeQuiz,
    ReponseTentative,
    Inscription,
    SessionApprentissage,
    HistoriqueActivite,
)
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


@api_view(["GET"])
def profil_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        "nom": user.nom,
        "email": user.email,
        "role": user.role,
        "id": user.id,
    })


@api_view(["POST"])
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

    @action(detail=True, methods=["get"])
    def progression(self, request, pk=None):
        etudiant = self.get_object()
        serializer = self.get_serializer(etudiant)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CoursViewSet(viewsets.ModelViewSet):
    serializer_class = CoursSerializer

    def get_queryset(self):
        queryset = Cours.objects.select_related("enseignant").all()

        enseignant_id = self.request.query_params.get("enseignant")
        if enseignant_id:
            queryset = queryset.filter(enseignant_id=enseignant_id)

        user = get_user_from_token(self.request)
        mine_only = self.request.query_params.get("mine")

        if mine_only == "true" and user:
            try:
                enseignant = Enseignant.objects.get(id=user.id)
                queryset = queryset.filter(enseignant=enseignant)
            except Enseignant.DoesNotExist:
                return Cours.objects.none()

        return queryset.order_by("id")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        user = get_user_from_token(request)

        if not user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            enseignant = Enseignant.objects.get(id=user.id)
        except Enseignant.DoesNotExist:
            return Response(
                {"success": False, "message": "Accès réservé aux enseignants"},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data.copy()

        if "temps_apprentissage" not in data:
            data["temps_apprentissage"] = 0

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(enseignant=enseignant)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def quizzes(self, request, pk=None):
        cours = self.get_object()
        quizzes = Quiz.objects.filter(cours=cours).select_related("cours", "enseignant")
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentCourseViewSet(viewsets.ViewSet):
    def list(self, request):
        user = get_user_from_token(request)

        if not user or user.role != "etudiant":
            return Response(
                {"detail": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            student = Etudiant.objects.get(id=user.id)
        except Etudiant.DoesNotExist:
            return Response(
                {"detail": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        courses = Cours.objects.filter(is_published=True).select_related("enseignant").prefetch_related("lecons")

        serializer = StudentCourseSerializer(
            courses,
            many=True,
            context={"student": student, "request": request},
        )
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        user = get_user_from_token(request)

        if not user or user.role != "etudiant":
            return Response(
                {"detail": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            student = Etudiant.objects.get(id=user.id)
        except Etudiant.DoesNotExist:
            return Response(
                {"detail": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            course = Cours.objects.select_related("enseignant").prefetch_related("lecons").get(pk=pk)
        except Cours.DoesNotExist:
            return Response(
                {"detail": "Cours not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentCourseSerializer(
            course,
            context={"student": student, "request": request},
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def favorite(self, request, pk=None):
        user = get_user_from_token(request)

        if not user or user.role != "etudiant":
            return Response(
                {"detail": "Unauthorized"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            student = Etudiant.objects.get(id=user.id)
            course = Cours.objects.get(pk=pk)
        except (Etudiant.DoesNotExist, Cours.DoesNotExist):
            return Response(
                {"detail": "Not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        insc, _created = Inscription.objects.get_or_create(etudiant=student, cours=course)
        insc.favoris = not insc.favoris
        insc.save()

        return Response({"favoris": insc.favoris}, status=status.HTTP_200_OK)


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer

    def get_queryset(self):
        queryset = (
            Quiz.objects.all()
            .select_related("cours", "enseignant")
            .prefetch_related("questions", "tentatives")
        )

        enseignant_id = self.request.query_params.get("enseignant")
        cours_id = self.request.query_params.get("cours")

        if enseignant_id:
            queryset = queryset.filter(enseignant_id=enseignant_id)

        if cours_id:
            queryset = queryset.filter(cours_id=cours_id)

        return queryset.order_by("-date_creation")


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        queryset = (
            Question.objects.all()
            .select_related("quiz")
            .prefetch_related("choix")
        )

        quiz_id = self.request.query_params.get("quiz")
        if quiz_id:
            queryset = queryset.filter(quiz_id=quiz_id)

        return queryset.order_by("ordre")


class ChoixQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = ChoixQuestionSerializer

    def get_queryset(self):
        queryset = ChoixQuestion.objects.all().select_related("question")

        question_id = self.request.query_params.get("question")
        if question_id:
            queryset = queryset.filter(question_id=question_id)

        return queryset.order_by("ordre")


@api_view(["GET"])
def student_quizzes_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        Etudiant.objects.get(id=user.id)
    except Etudiant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux étudiants"},
            status=status.HTTP_403_FORBIDDEN
        )

    quizzes = (
        Quiz.objects.filter(statut="publie")
        .select_related("cours")
        .prefetch_related("questions")
        .distinct()
    )

    serializer = StudentQuizSerializer(quizzes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
def teacher_dashboard_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    teacher_courses = (
        Cours.objects
        .filter(enseignant=enseignant)
        .order_by("-date_creation")
    )

    teacher_quizzes = Quiz.objects.filter(enseignant=enseignant)
    teacher_tentatives = TentativeQuiz.objects.filter(quiz__enseignant=enseignant)

    courses_count = teacher_courses.count()
    published_quizzes_count = teacher_quizzes.filter(statut="publie").count()

    students_count = (
        Inscription.objects
        .filter(cours__enseignant=enseignant)
        .values("etudiant_id")
        .distinct()
        .count()
    )

    total_attempts = teacher_tentatives.count()
    success_attempts = teacher_tentatives.filter(reussi=True).count()
    average_success_rate = round(
        (success_attempts / total_attempts * 100) if total_attempts > 0 else 0
    )

    recent_courses = []
    for course in teacher_courses[:3]:
        recent_courses.append({
            "id": course.id,
            "title": course.title,
            "students": course.inscriptions.count(),
            "quizzes": course.quizzes.count(),
            "status": course.status,
        })

    pending_quizzes_count = teacher_tentatives.filter(statut="soumis").count()
    draft_courses_count = teacher_courses.filter(status="brouillon").count()
    new_students_this_week = (
        Inscription.objects
        .filter(
            cours__enseignant=enseignant,
            date_inscription__gte=timezone.now() - timezone.timedelta(days=7)
        )
        .count()
    )

    alerts = []

    if pending_quizzes_count > 0:
        alerts.append({
            "type": "quiz_pending",
            "message": f"{pending_quizzes_count} quiz n’ont pas encore été corrigés automatiquement."
        })

    if draft_courses_count > 0:
        alerts.append({
            "type": "course_draft",
            "message": f"{draft_courses_count} cours ne sont pas encore publiés."
        })

    if new_students_this_week > 0:
        alerts.append({
            "type": "new_students",
            "message": f"{new_students_this_week} nouveaux étudiants se sont inscrits cette semaine."
        })

    if not alerts:
        alerts.append({
            "type": "info",
            "message": "Aucune notification pour le moment."
        })

    payload = {
        "stats": {
            "courses_count": courses_count,
            "published_quizzes_count": published_quizzes_count,
            "students_count": students_count,
            "average_success_rate": average_success_rate,
        },
        "recent_courses": recent_courses,
        "alerts": alerts,
    }

    return Response(payload, status=status.HTTP_200_OK)
@api_view(["POST"])
def submit_quiz_view(request, quiz_id):
    user = get_user_from_token(request)

    if not user:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        etudiant = Etudiant.objects.get(id=user.id)
    except Etudiant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux étudiants"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        quiz = Quiz.objects.prefetch_related("questions__choix").get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response(
            {"error": "Quiz introuvable"},
            status=status.HTTP_404_NOT_FOUND
        )

    answers = request.data.get("answers", [])
    time_spent_seconds = request.data.get("time_spent_seconds", 0)

    if not isinstance(answers, list):
        return Response(
            {"error": "Le champ answers doit être une liste."},
            status=status.HTTP_400_BAD_REQUEST
        )

    next_attempt_number = (
        TentativeQuiz.objects.filter(quiz=quiz, etudiant=etudiant).count() + 1
    )

    if next_attempt_number > quiz.tentatives_autorisees:
        return Response(
            {"error": "Nombre maximal de tentatives atteint."},
            status=status.HTTP_400_BAD_REQUEST
        )

    score_max = sum(question.points for question in quiz.questions.all())
    score = 0.0

    tentative = TentativeQuiz.objects.create(
        quiz=quiz,
        etudiant=etudiant,
        numero_tentative=next_attempt_number,
        statut="soumis",
        score=0,
        score_max=score_max,
        pourcentage=0,
        reussi=False,
        date_soumission=timezone.now(),
        temps_passe_secondes=time_spent_seconds or 0,
    )

    answers_by_question = {}
    for answer in answers:
        question_id = answer.get("question_id")
        choice_id = answer.get("choice_id")
        if question_id is not None:
            answers_by_question[question_id] = choice_id

    for question in quiz.questions.all():
        selected_choice_id = answers_by_question.get(question.id)

        selected_choice = None
        if selected_choice_id:
            selected_choice = question.choix.filter(id=selected_choice_id).first()

        is_correct = bool(selected_choice and selected_choice.est_correct)
        points_earned = question.points if is_correct else 0

        score += points_earned

        ReponseTentative.objects.create(
            tentative=tentative,
            question=question,
            choix_selectionne=selected_choice,
            est_correcte=is_correct,
            points_obtenus=points_earned,
        )

    pourcentage = (score / score_max * 100) if score_max > 0 else 0
    reussi = pourcentage >= quiz.score_reussite

    tentative.score = score
    tentative.pourcentage = round(pourcentage, 2)
    tentative.reussi = reussi
    tentative.save()

    serializer = QuizSubmissionResponseSerializer(tentative)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def teacher_quizzes_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    quizzes = (
        Quiz.objects.filter(enseignant=enseignant)
        .select_related("cours", "enseignant")
        .prefetch_related("questions", "tentatives")
        .order_by("-date_creation")
    )

    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def teacher_quiz_results_view(request, quiz_id):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        quiz = Quiz.objects.get(id=quiz_id, enseignant=enseignant)
    except Quiz.DoesNotExist:
        return Response(
            {"error": "Quiz introuvable"},
            status=status.HTTP_404_NOT_FOUND
        )

    tentatives = (
        TentativeQuiz.objects
        .filter(quiz=quiz)
        .select_related("etudiant", "quiz")
        .order_by("-date_soumission")
    )

    serializer = TeacherQuizResultSerializer(tentatives, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def login_view(request):
    email = request.data.get("email")
    mot_de_passe = request.data.get("mot_de_passe")

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


@api_view(["POST"])
def register_view(request):
    nom = request.data.get("nom")
    email = request.data.get("email")
    mot_de_passe = request.data.get("mot_de_passe")
    role = request.data.get("role", "etudiant")

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


@api_view(["GET"])
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

@api_view(["GET"])
def teacher_dashboard_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    teacher_courses = (
        Cours.objects
        .filter(enseignant=enseignant)
        .prefetch_related("inscriptions", "quizzes")
        .order_by("-date_creation")
    )

    teacher_quizzes = Quiz.objects.filter(enseignant=enseignant)
    teacher_attempts = TentativeQuiz.objects.filter(quiz__enseignant=enseignant)

    courses_count = teacher_courses.count()
    published_quizzes_count = teacher_quizzes.filter(statut="publie").count()

    students_count = (
        Inscription.objects
        .filter(cours__enseignant=enseignant)
        .values("etudiant_id")
        .distinct()
        .count()
    )

    total_attempts = teacher_attempts.count()
    success_attempts = teacher_attempts.filter(reussi=True).count()
    average_success_rate = round(
        (success_attempts / total_attempts * 100) if total_attempts > 0 else 0
    )

    recent_courses = []
    for course in teacher_courses[:3]:
        recent_courses.append({
            "id": course.id,
            "title": course.title,
            "students": course.inscriptions.count(),
            "quizzes": course.quizzes.count(),
            "status": course.status,
        })

    pending_quizzes_count = teacher_attempts.filter(statut="soumis").count()
    draft_courses_count = teacher_courses.filter(status="brouillon").count()
    new_students_this_week = (
        Inscription.objects.filter(
            cours__enseignant=enseignant,
            date_inscription__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
    )

    alerts = []

    if pending_quizzes_count > 0:
        alerts.append({
            "type": "quiz_pending",
            "message": f"{pending_quizzes_count} quiz n’ont pas encore été corrigés automatiquement."
        })

    if draft_courses_count > 0:
        alerts.append({
            "type": "course_draft",
            "message": f"{draft_courses_count} cours ne sont pas encore publiés."
        })

    if new_students_this_week > 0:
        alerts.append({
            "type": "new_students",
            "message": f"{new_students_this_week} nouveaux étudiants se sont inscrits cette semaine."
        })

    if not alerts:
        alerts.append({
            "type": "info",
            "message": "Aucune notification pour le moment."
        })

    payload = {
        "stats": {
            "courses_count": courses_count,
            "published_quizzes_count": published_quizzes_count,
            "students_count": students_count,
            "average_success_rate": average_success_rate,
        },
        "recent_courses": recent_courses,
        "alerts": alerts,
    }

    return Response(payload, status=status.HTTP_200_OK)

@api_view(["GET"])
def student_dashboard_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        etudiant = Etudiant.objects.get(id=user.id)
    except Etudiant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux étudiants"},
            status=status.HTTP_403_FORBIDDEN
        )

    inscriptions = Inscription.objects.filter(etudiant=etudiant).select_related("cours")
    tentatives = TentativeQuiz.objects.filter(etudiant=etudiant).select_related("quiz")
    sessions = SessionApprentissage.objects.filter(etudiant=etudiant)

    total_cours = inscriptions.count()
    cours_termines = inscriptions.filter(termine=True).count()

    moyenne_progression = inscriptions.aggregate(
        avg_progress=Avg("progression_percent")
    )["avg_progress"] or 0.0

    quiz_passes = tentatives.count()
    quiz_reussis = tentatives.filter(reussi=True).count()
    quiz_score = (quiz_reussis / quiz_passes * 100) if quiz_passes > 0 else 0.0

    temps_reel = sessions.aggregate(total=Sum("duree_minutes"))["total"] or 0
    temps_estime_total = inscriptions.aggregate(
        total=Sum("cours__temps_apprentissage")
    )["total"] or 0

    temps_score = (
        min((temps_reel / temps_estime_total) * 100, 100)
        if temps_estime_total > 0
        else 0.0
    )

    score_global = (
        0.50 * moyenne_progression +
        0.35 * quiz_score +
        0.15 * temps_score
    )

    courses_progress = [
        {
            "id": inscription.cours.id,
            "title": inscription.cours.title,
            "progress": round(inscription.progression_percent or 0, 2),
            "completed": inscription.termine,
        }
        for inscription in inscriptions.order_by("-progression_percent", "cours__title")
    ]

    best_quiz_scores = [
        {
            "id": tentative.id,
            "quiz_id": tentative.quiz.id,
            "code": (tentative.quiz.titre[:3] or "QZ").upper(),
            "title": tentative.quiz.titre,
            "score": f"{round(tentative.score, 2)} / {round(tentative.score_max, 2)}",
            "score_value": round(tentative.score, 2),
            "score_max": round(tentative.score_max, 2),
            "date_label": tentative.date_soumission.strftime("%d/%m/%Y")
            if tentative.date_soumission
            else "Date inconnue",
        }
        for tentative in tentatives.order_by("-score", "-date_soumission")[:4]
    ]

    recent_activity = [
        {
            "id": item.id,
            "type": item.type_activite,
            "title": item.titre,
            "meta": item.description or "",
            "date_label": item.date_creation.strftime("%d/%m/%Y"),
        }
        for item in HistoriqueActivite.objects.filter(etudiant=etudiant)[:5]
    ]

    payload = {
        "score_global": round(score_global, 2),
        "cours_score": round(moyenne_progression, 2),
        "quiz_score": round(quiz_score, 2),
        "temps_score": round(temps_score, 2),
        "cours_termines": cours_termines,
        "total_cours": total_cours,
        "quiz_reussis": quiz_reussis,
        "quiz_passes": quiz_passes,
        "temps_reel_minutes": temps_reel,
        "temps_estime_total_minutes": temps_estime_total,
        "courses_progress": courses_progress,
        "best_quiz_scores": best_quiz_scores,
        "recent_activity": recent_activity,
    }

    return Response(payload, status=status.HTTP_200_OK)
@api_view(["GET"])
def teacher_students_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    search = request.GET.get("search", "").strip().lower()
    status_filter = request.GET.get("status", "").strip()
    course_filter = request.GET.get("course", "").strip()

    teacher_courses = Cours.objects.filter(enseignant=enseignant).order_by("title")

    if course_filter:
        teacher_courses = teacher_courses.filter(id=course_filter)

    inscriptions = (
        Inscription.objects.filter(cours__in=teacher_courses)
        .select_related("etudiant", "cours")
        .order_by("etudiant__nom", "cours__title")
    )

    grouped_students = {}

    for inscription in inscriptions:
        etudiant = inscription.etudiant

        searchable_text = f"{etudiant.nom} {etudiant.email}".lower()
        if search and search not in searchable_text:
            continue

        if etudiant.id not in grouped_students:
            tentatives = TentativeQuiz.objects.filter(
                etudiant=etudiant,
                quiz__cours__enseignant=enseignant
            )

            moyenne_quiz = tentatives.aggregate(avg=Avg("pourcentage"))["avg"] or 0

            derniere_activite = (
                HistoriqueActivite.objects
                .filter(etudiant=etudiant)
                .order_by("-date_creation")
                .first()
            )

            grouped_students[etudiant.id] = {
                "id": etudiant.id,
                "nom": etudiant.nom,
                "email": etudiant.email,
                "initial": etudiant.nom[:1].upper() if etudiant.nom else "E",
                "courses": [],
                "progression_moyenne": 0,
                "moyenne_quiz": round(moyenne_quiz, 2),
                "derniere_activite": (
                    derniere_activite.titre if derniere_activite else "Aucune activité récente"
                ),
                "statut": "Actif",
            }

        grouped_students[etudiant.id]["courses"].append({
            "id": inscription.cours.id,
            "title": inscription.cours.title,
            "progression_percent": round(inscription.progression_percent or 0, 2),
            "termine": inscription.termine,
        })

    students = []

    for _student_id, student in grouped_students.items():
        progressions = [c["progression_percent"] for c in student["courses"]]
        progression_moyenne = round(sum(progressions) / len(progressions), 2) if progressions else 0
        student["progression_moyenne"] = progression_moyenne

        if progression_moyenne >= 80 and student["moyenne_quiz"] >= 70:
            student["statut"] = "Excellent"
        elif progression_moyenne < 40:
            student["statut"] = "À relancer"
        else:
            student["statut"] = "Actif"

        if status_filter and student["statut"] != status_filter:
            continue

        students.append(student)

    total_students = len(students)
    active_students = len([s for s in students if s["statut"] == "Actif"])
    excellent_students = len([s for s in students if s["statut"] == "Excellent"])
    to_follow_students = len([s for s in students if s["statut"] == "À relancer"])

    payload = {
        "summary": {
            "total_students": total_students,
            "active_students": active_students,
            "excellent_students": excellent_students,
            "to_follow_students": to_follow_students,
        },
        "students": students,
        "courses_filter": [
            {"id": course.id, "title": course.title}
            for course in Cours.objects.filter(enseignant=enseignant).order_by("title")
        ],
    }

    return Response(payload, status=status.HTTP_200_OK)


@api_view(["GET"])
def teacher_student_detail_view(request, student_id):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        enseignant = Enseignant.objects.get(id=user.id)
    except Enseignant.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux enseignants"},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        etudiant = Etudiant.objects.get(id=student_id)
    except Etudiant.DoesNotExist:
        return Response(
            {"error": "Étudiant introuvable"},
            status=status.HTTP_404_NOT_FOUND
        )

    teacher_courses = Cours.objects.filter(enseignant=enseignant)

    inscriptions = (
        Inscription.objects.filter(etudiant=etudiant, cours__in=teacher_courses)
        .select_related("cours")
        .order_by("cours__title")
    )

    if not inscriptions.exists():
        return Response(
            {"error": "Cet étudiant n'est lié à aucun de vos cours"},
            status=status.HTTP_403_FORBIDDEN
        )

    tentatives = (
        TentativeQuiz.objects.filter(
            etudiant=etudiant,
            quiz__cours__in=teacher_courses
        )
        .select_related("quiz", "quiz__cours")
        .order_by("-date_soumission")
    )

    activities = (
        HistoriqueActivite.objects.filter(
            etudiant=etudiant,
            cours__in=teacher_courses
        )
        .order_by("-date_creation")[:8]
    )

    courses_data = []
    all_progressions = []

    for inscription in inscriptions:
        all_progressions.append(inscription.progression_percent or 0)

        tentatives_cours = tentatives.filter(quiz__cours=inscription.cours)
        moyenne_quiz_cours = tentatives_cours.aggregate(avg=Avg("pourcentage"))["avg"] or 0

        courses_data.append({
            "course_id": inscription.cours.id,
            "course_title": inscription.cours.title,
            "progression_percent": round(inscription.progression_percent or 0, 2),
            "termine": inscription.termine,
            "note_moyenne": round(inscription.note_moyenne or 0, 2),
            "quiz_count": tentatives_cours.count(),
            "quiz_average": round(moyenne_quiz_cours, 2),
        })

    quizzes_data = [
        {
            "id": tentative.id,
            "quiz_id": tentative.quiz.id,
            "quiz_title": tentative.quiz.titre,
            "course_title": tentative.quiz.cours.title,
            "score": round(tentative.score, 2),
            "score_max": round(tentative.score_max, 2),
            "pourcentage": round(tentative.pourcentage, 2),
            "reussi": tentative.reussi,
            "date_label": (
                tentative.date_soumission.strftime("%d/%m/%Y")
                if tentative.date_soumission else "Date inconnue"
            ),
        }
        for tentative in tentatives[:10]
    ]

    recent_activity = [
        {
            "id": item.id,
            "type": item.type_activite,
            "title": item.titre,
            "description": item.description or "",
            "date_label": item.date_creation.strftime("%d/%m/%Y"),
        }
        for item in activities
    ]

    progression_moyenne = round(sum(all_progressions) / len(all_progressions), 2) if all_progressions else 0
    moyenne_quiz = round(tentatives.aggregate(avg=Avg("pourcentage"))["avg"] or 0, 2)

    if progression_moyenne >= 80 and moyenne_quiz >= 70:
        statut = "Excellent"
    elif progression_moyenne < 40:
        statut = "À relancer"
    else:
        statut = "Actif"

    payload = {
        "student": {
            "id": etudiant.id,
            "nom": etudiant.nom,
            "email": etudiant.email,
            "initial": etudiant.nom[:1].upper() if etudiant.nom else "E",
            "progression_moyenne": progression_moyenne,
            "moyenne_quiz": moyenne_quiz,
            "statut": statut,
        },
        "courses": courses_data,
        "quizzes": quizzes_data,
        "recent_activity": recent_activity,
    }

    return Response(payload, status=status.HTTP_200_OK)

@api_view(["GET"])
def topbar_view(request):
    user = get_user_from_token(request)

    if not user:
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    notifications = []

    # -------- PROF --------
    if user.role == "enseignant":
        teacher_courses = Cours.objects.filter(enseignant_id=user.id)

        unpublished_courses_count = teacher_courses.filter(
            status__iexact="brouillon"
        ).count()

        if unpublished_courses_count > 0:
            notifications.append({
                "type": "warning",
                "message": f"{unpublished_courses_count} cours non publiés"
            })

        unpublished_quizzes_count = Quiz.objects.filter(
            enseignant_id=user.id,
            statut__iexact="brouillon"
        ).count()

        if unpublished_quizzes_count > 0:
            notifications.append({
                "type": "info",
                "message": f"{unpublished_quizzes_count} quiz non publiés"
            })

        published_courses_without_quiz_count = teacher_courses.filter(
            status__iexact="publie",
            quizzes__isnull=True
        ).distinct().count()

        if published_courses_without_quiz_count > 0:
            notifications.append({
                "type": "reminder",
                "message": f"{published_courses_without_quiz_count} cours publiés sans quiz"
            })

    # -------- ETUDIANT --------
    elif user.role == "etudiant":
        try:
            etudiant = Etudiant.objects.get(id=user.id)
        except Etudiant.DoesNotExist:
            return Response(
                {"error": "Étudiant introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        inscriptions = Inscription.objects.filter(etudiant=etudiant).select_related("cours")

        low_progress_courses = inscriptions.filter(progression_percent__lt=50)
        for inscription in low_progress_courses[:3]:
            notifications.append({
                "type": "progress",
                "message": f"Continuez le cours « {inscription.cours.title} »"
            })

        failed_quizzes_count = Quiz.objects.filter(
            tentatives__etudiant=etudiant,
            tentatives__reussi=False
        ).distinct().count()

        if failed_quizzes_count > 0:
            notifications.append({
                "type": "quiz",
                "message": f"{failed_quizzes_count} quiz à retravailler"
            })

    payload = {
        "user": {
            "id": user.id,
            "nom": user.nom,
            "email": user.email,
            "role": user.role,
        },
        "notifications_count": len(notifications),
        "notifications": notifications[:5],
    }

    return Response(payload, status=status.HTTP_200_OK)