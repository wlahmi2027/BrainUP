from django.db.models import Count
from API.models import Cours, TentativeQuiz, Inscription, Recommandation


def build_recommendations_payload(etudiant):
    # =========================
    # 1. Récupération données
    # =========================

    attempts = TentativeQuiz.objects.filter(etudiant=etudiant).select_related("quiz", "quiz__cours")
    inscriptions = Inscription.objects.filter(etudiant=etudiant).select_related("cours")

    # =========================
    # 2. RECOMMANDÉ POUR VOUS
    # =========================

    recommended = []

    for cours in Cours.objects.all():
        score = 0

        # bonus si déjà inscrit
        if inscriptions.filter(cours=cours).exists():
            score += 0.3

        # bonus si quiz lié réussi
        related_attempts = attempts.filter(quiz__cours=cours)

        if related_attempts.exists():
            avg_score = sum(a.pourcentage for a in related_attempts) / len(related_attempts)

            if avg_score < 50:
                score += 0.4
            else:
                score += 0.2

        # bonus progression globale
        if etudiant.progression > 50:
            score += 0.1

        if score > 0:
            recommended.append({
                "course_id": cours.id,
                "title": cours.title,
                "description": cours.description,
                "score_label": f"{int(score * 100)}%",
                "reason": "Basé sur votre activité récente.",
                "route": f"/student/courses/{cours.id}",
            })

            # sauvegarde (facultatif mais OK avec ton modèle)
            Recommandation.objects.update_or_create(
                utilisateur=etudiant,
                cours=cours,
                defaults={"score_recommendation": score},
            )

    recommended.sort(key=lambda x: x["score_label"], reverse=True)

    # =========================
    # 3. CONTINUE LEARNING
    # =========================

    continue_learning = None

    in_progress = inscriptions.filter(termine=False).order_by("-progression_percent").first()

    if in_progress:
        continue_learning = {
            "course_id": in_progress.cours.id,
            "title": in_progress.cours.title,
            "description": "Continuez votre progression.",
            "progress": in_progress.progression_percent,
            "progress_label": f"{int(in_progress.progression_percent)}%",
            "route": f"/student/courses/{in_progress.cours.id}",
        }

    # =========================
    # 4. AMÉLIORER RÉSULTATS
    # =========================

    improve = []

    weak_attempts = attempts.filter(pourcentage__lt=50)

    seen = set()

    for a in weak_attempts:
        cours = a.quiz.cours

        if cours.id in seen:
            continue

        improve.append({
            "course_id": cours.id,
            "title": cours.title,
            "score_label": f"{int(a.pourcentage)}%",
            "reason": f"Score faible au quiz {a.quiz.titre}",
            "route": f"/student/courses/{cours.id}",
            "action_label": "Revoir le cours",
        })

        seen.add(cours.id)

    # =========================
    # 5. POPULAR COURSES
    # =========================

    popular = []

    for cours in Cours.objects.all():
        count = TentativeQuiz.objects.filter(quiz__cours=cours).count()

        popular.append({
            "course_id": cours.id,
            "title": cours.title,
            "description": cours.description,
            "popularity_count": count,
            "badge": "Populaire" if count > 0 else "Nouveau",
            "route": f"/student/courses/{cours.id}",
        })

    popular.sort(key=lambda x: x["popularity_count"], reverse=True)

    # =========================
    # 6. RETURN FINAL
    # =========================

    return {
        "recommended_for_you": recommended[:3],
        "continue_learning": continue_learning,
        "improve_results": improve[:3],
        "popular_courses": popular[:3],
    }