from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EtudiantViewSet,
    CoursViewSet,
    QuizViewSet,
    QuestionViewSet,
    ChoixQuestionViewSet,
    LeconViewSet,
    StudentCourseViewSet,
    login_view,
    logout_view,
    register_view,
    recommendations_view,
    student_quizzes_view,
    submit_quiz_view,
    teacher_quizzes_view,
    teacher_quiz_results_view,
    topbar_view,
    profil_view,
    teacher_dashboard_view,
    student_dashboard_view,
)
router = DefaultRouter()
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')
router.register(r'courses', CoursViewSet, basename='courses')
router.register(r'quiz', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'choix', ChoixQuestionViewSet, basename='choix')
router.register(r'lecons', LeconViewSet, basename='lecons')
router.register(r'student/courses', StudentCourseViewSet, basename='student-courses')

urlpatterns = [
    path('', include(router.urls)),

    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_view, name='register'),

    path('recommendations/<int:user_id>/', recommendations_view, name='recommendations'),

    path('student/quizzes/', student_quizzes_view, name='student-quizzes'),
    path('student/quizzes/<int:quiz_id>/submit/', submit_quiz_view, name='student-quiz-submit'),

    path('teacher/quizzes/', teacher_quizzes_view, name='teacher-quizzes'),
    path('teacher/quizzes/<int:quiz_id>/results/', teacher_quiz_results_view, name='teacher-quiz-results'),

    path('topbar/', topbar_view, name='topbar'),
    path('profil/', profil_view, name='profil'),
    path('teacher/dashboard/', teacher_dashboard_view, name='teacher-dashboard'),
    path('student/dashboard/', student_dashboard_view, name='student-dashboard'),
]