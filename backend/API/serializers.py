from rest_framework import serializers
from API.models import Etudiant

class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ['progression']

