from rest_framework import serializers
from API.models import Etudiant, Cours, Quiz


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ["id", "nom", "email", "progression", "score_moyen"]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "titre"]


class CoursSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="enseignant.nom", read_only=True)
    subtitle = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    votes = serializers.SerializerMethodField()
    isFavorite = serializers.SerializerMethodField()

    class Meta:
        model = Cours
        fields = [
            "id",
            "title",
            "description",
            "author",
            "subtitle",
            "level",
            "rating",
            "votes",
            "isFavorite",
        ]

    def get_subtitle(self, obj):
        return "Cours & exercices"

    def get_level(self, obj):
        text = (obj.title + " " + obj.description).lower()
        if "début" in text or "introduction" in text:
            return "Débutant"
        if "avancé" in text:
            return "Avancé"
        return "Intermédiaire"

    def get_rating(self, obj):
        return 0

    def get_votes(self, obj):
        return 0

    def get_isFavorite(self, obj):
        return False