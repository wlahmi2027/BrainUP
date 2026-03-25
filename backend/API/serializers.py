from rest_framework import serializers
from API.models import Etudiant, Cours, Quiz, Inscription, Lecon
from PIL import Image

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ["id", "nom", "email", "progression", "score_moyen"]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "titre"]


class LeconSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lecon
        fields = ["id", "titre", "ordre", "contenu"]
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        request = self.context.get("request")
        if instance.contenu:
            rep["contenu"] = request.build_absolute_uri(instance.contenu.url)
        else:
            rep["contenu"] = None

        return rep


#for teachers :
class CoursSerializer(serializers.ModelSerializer):
    banniere = serializers.ImageField(required=False, allow_null=True)
    lecons = LeconSerializer(source="lecon_set", many=True, read_only=True)

    class Meta:
        model = Cours
        fields = ["id", "title", "temps_apprentissage", "niveau", "description", "status", "banniere", "lecons"]

    def get_banniere(self, obj):
        request = self.context.get("request")
        if obj.banniere:
            return request.build_absolute_uri(obj.banniere.url)
        return None


    def validate_banniere(self, file):
        max_size = 5 * 1024 * 1024
        if file.size > max_size:
            raise serializers.ValidationError("Image too large (max 5MB).")

        try:
            file.seek(0)

            img = Image.open(file)
            img.verify()

        except Exception:
            raise serializers.ValidationError("Invalid image file.")

        file.seek(0)

        return file

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        request = self.context.get("request")
        if instance.banniere:
            representation["banniere"] = request.build_absolute_uri(instance.banniere.url)
        else:
            representation["banniere"] = None

        return representation


class StudentCourseSerializer(serializers.ModelSerializer):
    enseignant = serializers.SerializerMethodField()
    inscription = serializers.SerializerMethodField()
    lecons_count = serializers.SerializerMethodField()
    etudiants_count = serializers.SerializerMethodField()
    lecons = LeconSerializer(source="lecon_set", many=True, read_only=True)
    banniere = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = [
            "id",
            "title",
            "description",
            "niveau",
            "enseignant",
            "inscription",
            "lecons_count",
            "etudiants_count",
            "lecons",
            "banniere"
        ]

    def get_enseignant(self, obj):
        return {"id": obj.enseignant.id, "nom": obj.enseignant.nom}

    def get_inscription(self, obj):
        student = self.context.get("student")
        if not student:
            return None
        try:
            insc = Inscription.objects.get(etudiant=student, cours=obj)
            return {
                "progression": insc.progression,
                "favoris": insc.favoris,
                "note_moyenne": insc.note_moyenne,
            }
        except Inscription.DoesNotExist:
            return None

    def get_lecons_count(self, obj):
        return obj.lecon_set.count()

    def get_etudiants_count(self, obj):
        return obj.etudiants.count()

    def get_banniere(self, obj):
        request = self.context.get("request")
        if obj.banniere:
            return request.build_absolute_uri(obj.banniere.url) if request else obj.banniere.url
        return None

