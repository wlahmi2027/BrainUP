from django.db import models


class Utilisateur(models.Model):
    ROLE_CHOICES = [
    ('etudiant', 'Etudiant'),
    ('enseignant', 'Enseignant'),
    ('admin', 'Admin'),
    ]
    nom = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='etudiant'
    )

    token = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.nom


class Etudiant(Utilisateur):
    progression = models.FloatField(default=0.0)
    score_moyen = models.FloatField(default=0.0)
    cours = models.ManyToManyField('Cours', through='Inscription', related_name='etudiants_liste')   # etudiant_list for reverse lookup

    def __str__(self):
        return f"{self.nom} (Etudiant)"


class Inscription(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    cours = models.ForeignKey('Cours', on_delete=models.CASCADE)

    note_moyenne = models.FloatField(default=0.0)
    evaluation = models.IntegerField(null=True, blank=True)
    termine = models.BooleanField(default=False)

    date_inscription = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('etudiant', 'cours')  # one record per student per course

    def __str__(self):
        return f"{self.etudiant.nom} - {self.cours.title}"




class Enseignant(Utilisateur):
    specialite = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nom} (Enseignant)"



class Cours(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    enseignant = models.ForeignKey(Enseignant, on_delete=models.CASCADE)
    temps_apprentissage = models.IntegerField(default=0)

    etudiants = models.ManyToManyField('Etudiant', through='Inscription', related_name='cours_liste')   # cours_list for reverse lookup



    def __str__(self):
        return self.title



class Lecon(models.Model):
    titre = models.CharField(max_length=255)
    contenu = models.TextField()
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE)

    def __str__(self):
        return self.titre



class Quiz(models.Model):
    titre = models.CharField(max_length=255)
    cours = models.ForeignKey('Cours', on_delete=models.CASCADE)

    def __str__(self):
        return self.titre



class Question(models.Model):
    enonce = models.TextField()
    options = models.CharField(max_length=255)
    reponse_correcte = models.CharField(max_length=255)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    def __str__(self):
        return f"Question {self.id} for {self.quiz.titre}"



class Resultat(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField()
    date = models.DateField()

    def __str__(self):
        return f"{self.utilisateur.nom} - {self.quiz.titre}: {self.score}"


class Recommandation(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    cours = models.ForeignKey('Cours', on_delete=models.CASCADE)
    score_recommendation = models.FloatField()

    def __str__(self):
        return f"{self.utilisateur.nom} → {self.cours.title} ({self.score_recommendation})"