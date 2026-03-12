from rest_framework import serializers
from API.models import Etudiant, Cours, Quiz, Question, ChoixQuestion, TentativeQuiz

class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ["id", "nom", "email", "progression", "score_moyen"]


class ChoixQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoixQuestion
        fields = ['id', 'question', 'texte', 'est_correct', 'ordre']
        read_only_fields = ['id']


class QuestionSerializer(serializers.ModelSerializer):
    choix = ChoixQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id',
            'quiz',
            'enonce',
            'type_question',
            'points',
            'ordre',
            'explication',
            'choix',
        ]
        read_only_fields = ['id']

class QuizSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField(read_only=True)
    tentatives_count = serializers.SerializerMethodField(read_only=True)
    moyenne_score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'titre',
            'description',
            'cours',
            'enseignant',
            'niveau',
            'temps_limite_minutes',
            'tentatives_autorisees',
            'score_reussite',
            'statut',
            'melanger_questions',
            'afficher_feedback',
            'date_creation',
            'date_modification',
            'date_publication',
            'questions_count',
            'tentatives_count',
            'moyenne_score',
        ]
        read_only_fields = [
            'id',
            'date_creation',
            'date_modification',
            'questions_count',
            'tentatives_count',
            'moyenne_score',
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_tentatives_count(self, obj):
        return obj.tentatives.count()

    def get_moyenne_score(self, obj):
        tentatives = obj.tentatives.all()
        if not tentatives.exists():
            return 0
        total = sum(t.score for t in tentatives)
        return round(total / tentatives.count(), 2)

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
            "enseignant",
            "author",
            "subtitle",
            "level",
            "rating",
            "votes",
            "isFavorite",
        ]
        read_only_fields = ["id", "author", "subtitle", "level", "rating", "votes", "isFavorite"]

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