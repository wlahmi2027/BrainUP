from collections import defaultdict
from django.db.models import Count

from API.models import Cours, Recommandation


def _normalize(text):
    return (text or "").lower()


def _keyword_bonus(text, keywords):
    score = 0.0
    for kw in keywords:
        if kw in text:
            score += 0.08
    return score


def _course_text(cours):
    return f"{cours.title} {cours.description}".lower()


def _score_course_for_student(etudiant, cours, results):
    score = 0.0
    reasons = []
    text = _course_text(cours)

    # Niveau global selon progression
    if etudiant.progression < 30:
        if any(k in text for k in ["introduction", "bases", "début", "python"]):
            score += 0.35
            reasons.append("Adapté à votre niveau actuel.")
    elif etudiant.progression < 70:
        score += 0.18
        reasons.append("Pertinent pour poursuivre votre apprentissage.")
    else:
        if any(k in text for k in ["avancé", "ia", "analyse", "data", "chatbot"]):
            score += 0.30
            reasons.append("Compatible avec votre progression avancée.")

    # Niveau global selon score moyen
    if etudiant.score_moyen < 50:
        if any(k in text for k in ["introduction", "bases", "début"]):
            score += 0.30
            reasons.append("Recommandé pour renforcer vos bases.")
    elif etudiant.score_moyen >= 70:
        if any(k in text for k in ["ia", "analyse", "data", "chatbot", "python"]):
            score += 0.22
            reasons.append("Compatible avec vos bonnes performances.")

    # Historique des résultats quiz
    weak_matches = 0
    strong_matches = 0

    for result in results:
        quiz_title = _normalize(result.quiz.titre)
        if any(word in text for word in quiz_title.split() if len(word) > 3):
            if result.score < 50:
                weak_matches += 1
            else:
                strong_matches += 1

    if weak_matches:
        score += min(0.25, weak_matches * 0.12)
        reasons.append("Peut vous aider à progresser sur des thèmes où vous avez eu des difficultés.")

    if strong_matches:
        score += min(0.15, strong_matches * 0.05)
        reasons.append("En lien avec vos bons résultats récents.")

    # Bonus mots-clés simples
    score += _keyword_bonus(text, ["python", "data", "analyse", "ia", "chatbot", "javascript"])

    score = min(score, 1.0)

    if not reasons:
        reasons.append("Cours suggéré selon votre profil d’apprentissage.")

    return round(score, 2), " ".join(dict.fromkeys(reasons))


def _build_recommended_for_you(etudiant, results):
    items = []

    for cours in Cours.objects.select_related("enseignant").all():
        score, reason = _score_course_for_student(etudiant, cours, results)

        if score > 0:
            items.append({
                "course_id": cours.id,
                "title": cours.title,
                "description": cours.description,
                "teacher": cours.enseignant.nom if cours.enseignant else "",
                "score": score,
                "score_label": f"{int(score * 100)}%",
                "reason": reason,
                "route": f"/cours/{cours.id}",
            })

    items.sort(key=lambda x: x["score"], reverse=True)

    # Sauvegarde top 5
    for rec in items[:5]:
        cours = Cours.objects.get(id=rec["course_id"])
        Recommandation.objects.update_or_create(
            utilisateur=etudiant,
            cours=cours,
            defaults={"score_recommendation": rec["score"]},
        )

    return items[:3]


def _build_continue_learning(etudiant):
    if etudiant.progression <= 0:
        return None

    # On choisit un cours "intro" si possible, sinon le premier cours
    cours = (
        Cours.objects.filter(title__icontains="python").select_related("enseignant").first()
        or Cours.objects.select_related("enseignant").first()
    )

    if not cours:
        return None

    return {
        "course_id": cours.id,
        "title": cours.title,
        "description": "Continuez là où vous vous êtes arrêté.",
        "progress": round(etudiant.progression, 1),
        "progress_label": f"{int(etudiant.progression)}%",
        "route": f"/cours/{cours.id}",
    }


def _build_improve_results(etudiant, results):
    weak_results = [r for r in results if r.score < 50]
    weak_results.sort(key=lambda r: r.score)

    items = []
    seen_courses = set()

    for result in weak_results:
        cours = result.quiz.cours
        if cours.id in seen_courses:
            continue

        items.append({
            "course_id": cours.id,
            "title": cours.title,
            "quiz_title": result.quiz.titre,
            "score": round(result.score, 1),
            "score_label": f"{int(result.score)}%",
            "reason": f"Vous avez obtenu {int(result.score)}% au quiz « {result.quiz.titre} ».",
            "route": f"/cours/{cours.id}",
            "action_label": f"Revoir {cours.title}",
        })
        seen_courses.add(cours.id)

    return items[:3]


def _build_popular_courses():
    # Popularité basée sur le nombre de résultats liés aux quiz du cours
    popular_qs = (
        Cours.objects.annotate(quiz_result_count=Count("quiz__resultat"))
        .select_related("enseignant")
        .order_by("-quiz_result_count", "title")
    )

    items = []
    for cours in popular_qs[:3]:
        items.append({
            "course_id": cours.id,
            "title": cours.title,
            "description": cours.description,
            "popularity_count": cours.quiz_result_count,
            "badge": "Populaire",
            "route": f"/cours/{cours.id}",
        })

    return items


def build_recommendations_payload(etudiant):
    results = list(
        Resultat.objects.filter(utilisateur=etudiant)
        .select_related("quiz", "quiz__cours")
        .order_by("-date")
    )

    return {
        "user": {
            "id": etudiant.id,
            "nom": etudiant.nom,
            "progression": etudiant.progression,
            "score_moyen": etudiant.score_moyen,
        },
        "recommended_for_you": _build_recommended_for_you(etudiant, results),
        "continue_learning": _build_continue_learning(etudiant),
        "improve_results": _build_improve_results(etudiant, results),
        "popular_courses": _build_popular_courses(),
    }