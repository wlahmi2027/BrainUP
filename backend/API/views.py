from rest_framework import viewsets
from .models import Etudiant
from .serializers import EtudiantSerializer

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    # ^placeholder, change this later
