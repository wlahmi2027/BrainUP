from rest_framework import routers
from django.urls import path, include
from API.views import (
    EtudiantViewSet,
    CoursViewSet,
    login_view,
    logout_view,
    register_view,
    recommendations_view,
    QuizViewSet,
    QuestionViewSet,
    ChoixQuestionViewSet,
    student_quizzes_view,
    submit_quiz_view,
    teacher_quizzes_view,
    teacher_quiz_results_view,
)

router = routers.DefaultRouter()
router.register(r'etudiants', EtudiantViewSet)
router.register(r'courses', CoursViewSet, basename='courses')
router.register(r'quiz', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'choix', ChoixQuestionViewSet, basename='choix')

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/login/", login_view, name="login"),
    path("api/logout/", logout_view, name="logout"),
    path("api/register/", register_view, name="register"),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/recommendations/<int:user_id>/", recommendations_view, name="recommendations"),
    path("api/student/quizzes/", student_quizzes_view, name="student-quizzes"),
    path("api/student/quizzes/<int:quiz_id>/submit/", submit_quiz_view, name="student-quiz-submit"),
    path("api/teacher/quizzes/", teacher_quizzes_view, name="teacher-quizzes"),
    path("api/teacher/quizzes/<int:quiz_id>/results/", teacher_quiz_results_view, name="teacher-quiz-results"),
]