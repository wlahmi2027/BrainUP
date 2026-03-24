from rest_framework import routers
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from API.views import (
    EtudiantViewSet,
    CoursViewSet,
    QuizViewSet,
    QuestionViewSet,
    ChoixQuestionViewSet,
    StudentCourseViewSet,
    login_view,
    logout_view,
    register_view,
    recommendations_view,
    student_quizzes_view,
    submit_quiz_view,
    teacher_quizzes_view,
    teacher_quiz_results_view,
    student_dashboard_view,
    teacher_dashboard_view,
    teacher_students_view,
    teacher_student_detail_view,
    topbar_view,
)
router = routers.DefaultRouter()
router.register(r"etudiants", EtudiantViewSet, basename="etudiants")
router.register(r"courses", CoursViewSet, basename="courses")
router.register(r"quiz", QuizViewSet, basename="quiz")
router.register(r"questions", QuestionViewSet, basename="questions")
router.register(r"choix", ChoixQuestionViewSet, basename="choix")

student_courses = StudentCourseViewSet.as_view({
    "get": "list",
})
student_course_detail = StudentCourseViewSet.as_view({
    "get": "retrieve",
})
student_course_favorite = StudentCourseViewSet.as_view({
    "post": "favorite",
})

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/topbar/", topbar_view, name="topbar"),
    path("api/login/", login_view, name="login"),
    path("api/logout/", logout_view, name="logout"),
    path("api/register/", register_view, name="register"),

    path("api/student/courses/", student_courses, name="student-courses"),
    path("api/student/courses/<int:pk>/", student_course_detail, name="student-course-detail"),
    path("api/student/courses/<int:pk>/favorite/", student_course_favorite, name="student-course-favorite"),

    path("api/recommendations/<int:user_id>/", recommendations_view, name="recommendations"),
    path("api/student/quizzes/", student_quizzes_view, name="student-quizzes"),
    path("api/student/quizzes/<int:quiz_id>/submit/", submit_quiz_view, name="student-quiz-submit"),
    path("api/teacher/quizzes/", teacher_quizzes_view, name="teacher-quizzes"),
    path("api/teacher/quizzes/<int:quiz_id>/results/", teacher_quiz_results_view, name="teacher-quiz-results"),
    path("api/student/dashboard/", student_dashboard_view, name="student-dashboard"),
    path("api/teacher/dashboard/", teacher_dashboard_view, name="teacher-dashboard"),
    path("api/teacher/students/", teacher_students_view, name="teacher-students"),
    path("api/teacher/students/<int:student_id>/", teacher_student_detail_view, name="teacher-student-detail"),
    path("api/chatbot/", include("chatbot.urls")),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)