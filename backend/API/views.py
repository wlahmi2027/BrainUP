from rest_framework import viewsets
from API.models import Etudiant
from API.serializers import EtudiantSerializer

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    # ^placeholder, change this later
