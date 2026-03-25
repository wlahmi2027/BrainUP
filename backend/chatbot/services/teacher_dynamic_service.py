from API.models import Enseignant, Cours, Quiz, Lecon, Inscription


def get_teacher_from_user(user):
    """
    Version de dev locale :
    on retourne le premier enseignant en base pour tester sans vraie auth.

    Quand ton système d'auth côté front sera prêt, remplace cette logique
    par une vraie récupération de l'enseignant connecté.
    """
    try:
        return Enseignant.objects.first()
    except Exception:
        return None


def get_teacher_stats(teacher):
    if not teacher:
        return None

    courses = Cours.objects.filter(enseignant=teacher)
    quizzes = Quiz.objects.filter(enseignant=teacher)
    lessons = Lecon.objects.filter(cours__enseignant=teacher)
    inscriptions = Inscription.objects.filter(cours__enseignant=teacher)

    return {
        "teacher_name": teacher.nom,
        "courses_count": courses.count(),
        "published_courses_count": courses.filter(status="publie").count(),
        "draft_courses_count": courses.filter(status="brouillon").count(),
        "quizzes_count": quizzes.count(),
        "published_quizzes_count": quizzes.filter(statut="publie").count(),
        "draft_quizzes_count": quizzes.filter(statut="brouillon").count(),
        "lessons_count": lessons.count(),
        "students_enrollments_count": inscriptions.count(),
        "courses_titles": list(courses.values_list("title", flat=True)[:10]),
        "quiz_titles": list(quizzes.values_list("titre", flat=True)[:10]),
    }


def build_teacher_dynamic_context(message, teacher):
    if not teacher:
        return None

    stats = get_teacher_stats(teacher)
    if not stats:
        return None

    msg = (message or "").lower()

    if "combien de cours publiés" in msg or "combien de cours publies" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a "
            f"{stats['published_courses_count']} cours publiés."
        )

    if "combien de brouillons" in msg or "cours en brouillon" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a "
            f"{stats['draft_courses_count']} cours en brouillon."
        )

    if "combien de cours" in msg or "nombre de cours" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a {stats['courses_count']} cours au total, "
            f"dont {stats['published_courses_count']} publiés et "
            f"{stats['draft_courses_count']} en brouillon."
        )

    if (
        "mes cours" in msg
        or "quels sont mes cours" in msg
        or "liste de mes cours" in msg
    ):
        if not stats["courses_titles"]:
            return f"L'enseignant {stats['teacher_name']} n'a actuellement aucun cours."
        return (
            f"Liste des cours de {stats['teacher_name']} : "
            + ", ".join(stats["courses_titles"])
            + "."
        )

    if "combien de quiz publiés" in msg or "combien de quiz publies" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a "
            f"{stats['published_quizzes_count']} quiz publiés."
        )

    if "combien de quiz en brouillon" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a "
            f"{stats['draft_quizzes_count']} quiz en brouillon."
        )

    if "combien de quiz" in msg or "nombre de quiz" in msg:
        return (
            f"L'enseignant {stats['teacher_name']} a créé {stats['quizzes_count']} quiz, "
            f"dont {stats['published_quizzes_count']} publiés et "
            f"{stats['draft_quizzes_count']} en brouillon."
        )

    if (
        "mes quiz" in msg
        or "quels sont mes quiz" in msg
        or "liste de mes quiz" in msg
    ):
        if not stats["quiz_titles"]:
            return f"L'enseignant {stats['teacher_name']} n'a actuellement créé aucun quiz."
        return (
            f"Liste des quiz de {stats['teacher_name']} : "
            + ", ".join(stats["quiz_titles"])
            + "."
        )

    if "combien d'étudiants" in msg or "combien etudiants" in msg or "inscrits" in msg:
        return (
            f"Le nombre total d'inscriptions d'étudiants sur les cours de "
            f"{stats['teacher_name']} est de {stats['students_enrollments_count']}."
        )

    if (
        "combien de leçons" in msg
        or "combien de lecons" in msg
        or "nombre de leçons" in msg
        or "nombre de lecons" in msg
    ):
        return (
            f"L'enseignant {stats['teacher_name']} a actuellement "
            f"{stats['lessons_count']} leçons réparties dans ses cours."
        )

    if "statistiques" in msg or "dashboard" in msg or "tableau de bord" in msg:
        return (
            f"Résumé enseignant pour {stats['teacher_name']} : "
            f"{stats['courses_count']} cours, "
            f"{stats['quizzes_count']} quiz, "
            f"{stats['lessons_count']} leçons et "
            f"{stats['students_enrollments_count']} inscriptions étudiantes."
        )

    return None