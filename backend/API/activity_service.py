from .models import HistoriqueActivite


def ajouter_activite(
    etudiant,
    type_activite,
    titre,
    description="",
    cours=None,
    quiz=None,
    lecon=None,
):
    return HistoriqueActivite.objects.create(
        etudiant=etudiant,
        type_activite=type_activite,
        titre=titre,
        description=description,
        cours=cours,
        quiz=quiz,
        lecon=lecon,
    )