from django.db import models
from django.utils import timezone

class Utilisateur(models.Model):
    ROLE_CHOICES = [
        ("etudiant", "Etudiant"),
        ("enseignant", "Enseignant"),
        ("admin", "Admin"),
    ]

    nom = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="etudiant")
    token = models.CharField(max_length=128, blank=True, null=True)
    last_online = models.DateTimeField(null=True, blank=True)
    date_registered = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom


class Etudiant(Utilisateur):
    progression = models.FloatField(default=0.0)
    score_moyen = models.FloatField(default=0.0)
    cours = models.ManyToManyField("Cours", through="Inscription", related_name="etudiants_liste")

    def __str__(self):
        return f"{self.nom} (Etudiant)"

class Enseignant(Utilisateur):
    specialite = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nom} (Enseignant)"


class Cours(models.Model):
    NIVEAUX_CHOIX = [
        ("debutant", "Débutant"),
        ("intermediaire", "Intermédiaire"),
        ("avance", "Avancé"),
    ]
    STATUS_CHOIX = [
        ('brouillon', 'Brouillon'),
        ('publie', 'Publié'),
        ('archive', 'Archivé')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE, related_name="cours")
    temps_apprentissage = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    # Ajouts conservateurs
    banniere = models.ImageField(upload_to="bannieres/", null=True, blank=True)
    niveau = models.CharField(max_length=20, choices=NIVEAUX_CHOIX, default="debutant")
    status = models.CharField(max_length=20, choices=STATUS_CHOIX, default="brouillon")

    etudiants = models.ManyToManyField("Etudiant", through="Inscription", related_name="cours_liste")

    def __str__(self):
        return self.title

    category = models.CharField(max_length=255, blank=True, null=True, default="")


class Inscription(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="inscriptions")
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="inscriptions")

    note_moyenne = models.FloatField(default=0.0)
    evaluation = models.IntegerField(null=True, blank=True)

    # Tes champs existants
    termine = models.BooleanField(default=False)
    progression_percent = models.FloatField(default=0.0)

    # Ajout du binôme sans casser l’existant
    favoris = models.BooleanField(default=False)

    date_inscription = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("etudiant", "cours")

    def __str__(self):
        return f"{self.etudiant.nom} - {self.cours.title}"


class Lecon(models.Model):
    titre = models.CharField(max_length=255)

    # Ton champ actuel
    contenu = models.TextField()

    # Ajout du binôme sans remplacement
    fichier = models.FileField(upload_to="lecons/", null=True, blank=True)

    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="lecons")
    ordre = models.PositiveIntegerField(default=1)
    duree_estimee_minutes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.titre

class ProgressionLecon(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="progressions_lecons")
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="progressions_lecons")
    lecon = models.ForeignKey(Lecon, on_delete=models.CASCADE, related_name="progressions_lecons")

    pages_vues_max = models.PositiveIntegerField(default=0)
    total_pages = models.PositiveIntegerField(default=0)
    progression_percent = models.FloatField(default=0.0)
    terminee = models.BooleanField(default=False)

    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("etudiant", "cours", "lecon")

    def __str__(self):
        return f"{self.etudiant.nom} - {self.lecon.titre} ({self.progression_percent}%)"
        
class Quiz(models.Model):
    STATUT_CHOICES = [
        ("brouillon", "Brouillon"),
        ("publie", "Publié"),
        ("archive", "Archivé"),
    ]

    NIVEAU_CHOICES = [
        ("debutant", "Débutant"),
        ("intermediaire", "Intermédiaire"),
        ("avance", "Avancé"),
    ]

    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="quizzes")
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE, related_name="quizzes")

    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default="debutant")
    temps_limite_minutes = models.PositiveIntegerField(default=0)
    tentatives_autorisees = models.PositiveIntegerField(default=1)
    score_reussite = models.FloatField(default=10.0)
    score_max = models.FloatField(default=20.0)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="brouillon")
    melanger_questions = models.BooleanField(default=False)
    afficher_feedback = models.BooleanField(default=True)

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_publication = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.titre


class Question(models.Model):
    TYPE_CHOICES = [
        ("choix_unique", "Choix unique"),
        ("choix_multiple", "Choix multiple"),
        ("vrai_faux", "Vrai/Faux"),
        ("reponse_courte", "Réponse courte"),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    enonce = models.TextField()
    type_question = models.CharField(max_length=30, choices=TYPE_CHOICES, default="choix_unique")
    points = models.FloatField(default=1.0)
    ordre = models.PositiveIntegerField(default=1)
    explication = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Q{self.ordre} - {self.quiz.titre}"


class ChoixQuestion(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choix")
    texte = models.CharField(max_length=255)
    est_correct = models.BooleanField(default=False)
    ordre = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.question.id} - {self.texte}"


class TentativeQuiz(models.Model):
    STATUT_TENTATIVE = [
        ("en_cours", "En cours"),
        ("soumis", "Soumis"),
        ("corrige", "Corrigé"),
        ("abandonne", "Abandonné"),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="tentatives")
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="tentatives_quiz")

    numero_tentative = models.PositiveIntegerField(default=1)
    statut = models.CharField(max_length=20, choices=STATUT_TENTATIVE, default="en_cours")

    score = models.FloatField(default=0.0)
    score_max = models.FloatField(default=20.0)
    pourcentage = models.FloatField(default=0.0)
    reussi = models.BooleanField(default=False)

    date_debut = models.DateTimeField(auto_now_add=True)
    date_soumission = models.DateTimeField(blank=True, null=True)
    temps_passe_secondes = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("quiz", "etudiant", "numero_tentative")

    def __str__(self):
        return f"{self.etudiant.nom} - {self.quiz.titre} (Tentative {self.numero_tentative})"


class ReponseTentative(models.Model):
    tentative = models.ForeignKey(TentativeQuiz, on_delete=models.CASCADE, related_name="reponses")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="reponses_tentatives")

    choix_selectionne = models.ForeignKey(
        ChoixQuestion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reponses_selectionnees",
    )

    reponse_texte = models.TextField(blank=True, null=True)
    est_correcte = models.BooleanField(null=True, blank=True)
    points_obtenus = models.FloatField(default=0.0)

    def __str__(self):
        return f"Tentative {self.tentative.id} - Question {self.question.id}"


class SessionApprentissage(models.Model):
    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name="sessions_apprentissage",
    )
    cours = models.ForeignKey(
        Cours,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sessions_apprentissage",
    )
    lecon = models.ForeignKey(
        Lecon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sessions_apprentissage",
    )
    duree_minutes = models.PositiveIntegerField(default=0)
    date_session = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.etudiant.nom} - {self.duree_minutes} min"


class Recommandation(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)
    score_recommendation = models.FloatField()

    def __str__(self):
        return f"{self.utilisateur.nom} → {self.cours.title} ({self.score_recommendation})"


class HistoriqueActivite(models.Model):
    TYPE_CHOICES = [
        ("quiz_reussi", "Quiz réussi"),
        ("quiz_echoue", "Quiz échoué"),
        ("cours_demarre", "Cours démarré"),
        ("cours_termine", "Cours terminé"),
        ("lecon_consultee", "Leçon consultée"),
        ("session_etude", "Session d’étude"),
    ]

    etudiant = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name="historique_activites",
    )

    type_activite = models.CharField(max_length=30, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)

    cours = models.ForeignKey(
        Cours,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="historique_activites",
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="historique_activites",
    )

    lecon = models.ForeignKey(
        Lecon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="historique_activites",
    )

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return f"{self.etudiant.nom} - {self.titre}"