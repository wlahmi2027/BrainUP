from rest_framework import serializers
from API.models import Etudiant, Cours, Quiz, Inscription


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ["id", "nom", "email", "progression", "score_moyen"]


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ["id", "titre"]

#for teachers :
class CoursSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cours
        fields = ['title', 'description', 'temps_apprentissage', 'niveau', 'status']

class StudentCourseSerializer(serializers.ModelSerializer):
    enseignant = serializers.SerializerMethodField()
    inscription = serializers.SerializerMethodField()
    lecons_count = serializers.SerializerMethodField()
    etudiants_count = serializers.SerializerMethodField()

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


"""
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

"""