from rest_framework import viewsets
from rest_framework.response import Response
from API.models import Etudiant
from API.serializers import EtudiantSerializer
from rest_framework.decorators import action

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    @action(detail=True, methods=['get'])
    def progression(self, request, pk=None):
        etudiant = self.get_object()  # fetches student with this PK
        serializer = EtudiantSerializer(etudiant)
        return Response(serializer.data)