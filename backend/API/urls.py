from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, ChoixQuestionViewSet

router = DefaultRouter()
router.register(r'quiz', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='questions')
router.register(r'choix', ChoixQuestionViewSet, basename='choix')

urlpatterns = [
    path('', include(router.urls)),
]