"""
URL configuration for Django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from rest_framework import routers
from django.urls import path, include
from API.views import (
    EtudiantViewSet,
    CoursViewSet,
    login_view,
    logout_view,
    register_view,
    recommendations_view,
    StudentCourseViewSet
)

"""
production -> fetches images and media using ngix, not directly via Django
in developpment, NOT production :
"""
from django.conf import settings
from django.conf.urls.static import static


router = routers.DefaultRouter()
router.register(r'etudiants', EtudiantViewSet)
router.register(r'courses', CoursViewSet, basename='courses')

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

    path("api/login/", login_view, name="login"),
    path('api/logout/', logout_view, name='logout'),
    path('api/register/', register_view, name='register'),

    path("api/student/courses/", student_courses, name="student-courses"),
    path("api/student/courses/<int:pk>/", student_course_detail, name="student-course-detail"),
    path("api/student/courses/<int:pk>/favorite/", student_course_favorite, name="student-course-favorite"),

    
    path('api/chatbot/', include('chatbot.urls')),
    path("api/recommendations/<int:user_id>/", recommendations_view, name="recommendations"),

]

# same, only for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)