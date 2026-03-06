from rest_framework import viewsets
from rest_framework.response import Response
from .models import Etudiant

from API.serializers import EtudiantSerializer
from rest_framework.decorators import action

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from rest_framework.permissions import AllowAny

from rest_framework.decorators import api_view, permission_classes

from .models import Utilisateur


class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def progression(self, request, pk=None):
        etudiant = self.get_object()  # fetches student with this PK
        serializer = EtudiantSerializer(etudiant)
        return Response(serializer.data)



@permission_classes([AllowAny])
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    mot_de_passe = request.data.get('mot_de_passe')

    print("Request data:", request.data)

    try:
        utilisateur = Utilisateur.objects.get(email=email)
        print("Found user:", utilisateur.email, utilisateur.mot_de_passe)

        if utilisateur.mot_de_passe == mot_de_passe:
            return Response({"success": True, "message": "Connexion réussie"})
        else:
            print("Password mismatch")
            return Response({"success": False, "message": "Mot de passe incorrect"}, status=401)

    except Utilisateur.DoesNotExist:
        print("User not found")
        return Response({"success": False, "message": "Email invalide"}, status=401)