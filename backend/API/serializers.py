from rest_framework import serializers
<<<<<<< HEAD
from API.models import (
    Etudiant,
    Cours,
    Quiz,
    Inscription,
    Lecon,
    Question,
    ChoixQuestion,
    TentativeQuiz,
    ReponseTentative,
)

=======
from API.models import Etudiant, Cours, Quiz, Inscription, Lecon
from PIL import Image
>>>>>>> d41dae3ad4bd2916900443322d8e325cea644fe3

class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = ["id", "nom", "email", "progression", "score_moyen"]
        read_only_fields = ["id"]


class ChoixQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoixQuestion
        fields = ["id", "question", "texte", "est_correct", "ordre"]
        read_only_fields = ["id"]


class QuestionSerializer(serializers.ModelSerializer):
    choix = ChoixQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "quiz",
            "enonce",
            "type_question",
            "points",
            "ordre",
            "explication",
            "choix",
        ]
        read_only_fields = ["id"]


class QuizSerializer(serializers.ModelSerializer):
    cours_title = serializers.CharField(source="cours.title", read_only=True)
    questions_count = serializers.SerializerMethodField()
    tentatives_count = serializers.SerializerMethodField()
    moyenne_score = serializers.SerializerMethodField()
    reussites_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id",
            "titre",
            "description",
            "cours",
            "cours_title",
            "enseignant",
            "niveau",
            "temps_limite_minutes",
            "tentatives_autorisees",
            "score_reussite",
            "score_max",
            "statut",
            "melanger_questions",
            "afficher_feedback",
            "date_creation",
            "date_modification",
            "date_publication",
            "questions_count",
            "tentatives_count",
            "moyenne_score",
            "reussites_count",
        ]
        read_only_fields = [
            "id",
            "date_creation",
            "date_modification",
            "cours_title",
            "questions_count",
            "tentatives_count",
            "moyenne_score",
            "reussites_count",
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_tentatives_count(self, obj):
        return obj.tentatives.count()

    def get_moyenne_score(self, obj):
        tentatives = obj.tentatives.all()
        if not tentatives.exists():
            return 0
        return round(sum(t.score for t in tentatives) / tentatives.count(), 2)

    def get_reussites_count(self, obj):
        return obj.tentatives.filter(reussi=True).count()


class StudentQuizSerializer(serializers.ModelSerializer):
    cours_title = serializers.CharField(source="cours.title", read_only=True)
    questions_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "titre",
            "description",
            "cours",
            "cours_title",
            "niveau",
            "temps_limite_minutes",
            "statut",
            "questions_count",
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()


class CoursSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="enseignant.nom", read_only=True)
    subtitle = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    votes = serializers.SerializerMethodField()
    isFavorite = serializers.SerializerMethodField()
    banniere = serializers.ImageField(required=False, allow_null=True)

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
            "temps_apprentissage",
            "niveau",
            "status",
            "banniere",
            "is_published",
            "date_creation",
        ]
        read_only_fields = [
            "id",
            "enseignant",
            "author",
            "subtitle",
            "level",
            "rating",
            "votes",
            "isFavorite",
            "date_creation",
        ]

    def get_subtitle(self, obj):
        return "Cours & exercices"

    def get_level(self, obj):
        mapping = {
            "debutant": "Débutant",
            "intermediaire": "Intermédiaire",
            "avance": "Avancé",
        }
        return mapping.get(obj.niveau, "Intermédiaire")

    def get_rating(self, obj):
        return 0

    def get_votes(self, obj):
        return 0

    def get_isFavorite(self, obj):
        return False


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
            representation["banniere"] = (
                request.build_absolute_uri(instance.banniere.url)
                if request
                else instance.banniere.url
            )
        else:
            representation["banniere"] = None

        return representation


class LeconSerializer(serializers.ModelSerializer):
    fichier = serializers.SerializerMethodField()

    class Meta:
        model = Lecon
<<<<<<< HEAD
        fields = ["id", "titre", "ordre", "contenu", "fichier", "duree_estimee_minutes"]

    def get_fichier(self, obj):
        request = self.context.get("request")
        if obj.fichier:
            return request.build_absolute_uri(obj.fichier.url) if request else obj.fichier.url
        return None

=======
        fields = ["id", "titre", "ordre", "contenu"]
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)

        request = self.context.get("request")
        if instance.contenu:
            rep["contenu"] = request.build_absolute_uri(instance.contenu.url)
        else:
            rep["contenu"] = None

        return rep
>>>>>>> d41dae3ad4bd2916900443322d8e325cea644fe3

class StudentCourseSerializer(serializers.ModelSerializer):
    enseignant = serializers.SerializerMethodField()
    inscription = serializers.SerializerMethodField()
    lecons_count = serializers.SerializerMethodField()
    etudiants_count = serializers.SerializerMethodField()
    lecons = LeconSerializer(many=True, read_only=True)
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
            "banniere",
            "temps_apprentissage",
            "status",
            "is_published",
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
                "progression_percent": insc.progression_percent,
                "termine": insc.termine,
                "favoris": insc.favoris,
                "note_moyenne": insc.note_moyenne,
            }
        except Inscription.DoesNotExist:
            return None

    def get_lecons_count(self, obj):
        return obj.lecons.count()

    def get_etudiants_count(self, obj):
        return obj.etudiants.count()

    def get_banniere(self, obj):
        request = self.context.get("request")
        if obj.banniere:
            return request.build_absolute_uri(obj.banniere.url) if request else obj.banniere.url
        return None


class TeacherQuizResultSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source="etudiant.nom", read_only=True)
    quiz_titre = serializers.CharField(source="quiz.titre", read_only=True)

    class Meta:
        model = TentativeQuiz
        fields = [
            "id",
            "quiz",
            "quiz_titre",
            "etudiant",
            "etudiant_nom",
            "numero_tentative",
            "score",
            "score_max",
            "pourcentage",
            "reussi",
            "statut",
            "date_debut",
            "date_soumission",
            "temps_passe_secondes",
        ]


class QuizSubmissionResponseSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source="etudiant.nom", read_only=True)
    quiz_titre = serializers.CharField(source="quiz.titre", read_only=True)

    class Meta:
        model = TentativeQuiz
        fields = [
            "id",
            "quiz",
            "quiz_titre",
            "etudiant",
            "etudiant_nom",
            "numero_tentative",
            "score",
            "score_max",
            "pourcentage",
            "reussi",
            "statut",
            "date_soumission",
        ]