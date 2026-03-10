import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../../api/recommendations";

const FALLBACK_RECOMMENDATIONS = {
  recommended_for_you: [
    {
      course_id: 1,
      title: "React pour débutants",
      score_label: "Très pertinent",
      description: "Un cours idéal pour renforcer vos bases en composants et hooks.",
      reason: "Basé sur vos derniers cours suivis en développement web.",
      route: "/student/courses/1",
    },
    {
      course_id: 2,
      title: "API REST avec Django",
      score_label: "Recommandé",
      description: "Apprenez à construire une API propre et sécurisée.",
      reason: "Correspond à votre intérêt pour le backend.",
      route: "/student/courses/2",
    },
  ],
  continue_learning: {
    title: "Introduction à Python",
    progress_label: "72% terminé",
    description: "Vous êtes proche de terminer ce module. Continuez pour valider vos acquis.",
    progress: 72,
    route: "/student/courses/3",
  },
  improve_results: [
    {
      course_id: 4,
      title: "Structures de données",
      score_label: "À renforcer",
      reason: "Vos derniers résultats sur les quiz d’algorithmique sont faibles.",
      action_label: "Revoir le cours",
      route: "/student/courses/4",
    },
  ],
  popular_courses: [
    {
      course_id: 5,
      title: "UX/UI Design Moderne",
      badge: "Populaire",
      description: "Un cours très consulté par les autres étudiants ce mois-ci.",
      popularity_count: 124,
      route: "/student/courses/5",
    },
    {
      course_id: 6,
      title: "Bases de données SQL",
      badge: "Tendance",
      description: "Très demandé pour renforcer les projets full-stack.",
      popularity_count: 98,
      route: "/student/courses/6",
    },
  ],
};

export default function Recommendations() {
  const navigate = useNavigate();

  const [data, setData] = useState(FALLBACK_RECOMMENDATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        setApiDown(false);

        const userId = 1;
        const payload = await getRecommendations(userId);

        setData({
          recommended_for_you: payload?.recommended_for_you || [],
          continue_learning: payload?.continue_learning || null,
          improve_results: payload?.improve_results || [],
          popular_courses: payload?.popular_courses || [],
        });
      } catch (err) {
        console.error("Erreur recommandations :", err);
        setApiDown(true);
        setError("Impossible de charger les recommandations depuis le serveur.");
        setData(FALLBACK_RECOMMENDATIONS);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="recommendations-page">
        <div className="recommendations-header">
          <h1>Recommandations</h1>
          <p>Chargement des suggestions personnalisées...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recommendations-page">
      <div className="recommendations-header">
        <h1>Recommandations</h1>
        <p>
          Découvrez des cours suggérés selon votre profil, vos résultats et votre
          progression.
        </p>

        {apiDown && (
          <p className="muted" style={{ marginTop: "10px" }}>
            Mode local activé : affichage des recommandations temporaires.
          </p>
        )}

        {error && !apiDown && (
          <p className="muted" style={{ marginTop: "10px" }}>
            {error}
          </p>
        )}
      </div>

      <section className="recommendations-section">
        <h2>⭐ Recommandé pour vous</h2>
        <div className="recommendations-grid">
          {data.recommended_for_you.length > 0 ? (
            data.recommended_for_you.map((item) => (
              <div key={item.course_id} className="recommendation-card">
                <div className="recommendation-card-top">
                  <h3>{item.title}</h3>
                  <span className="recommendation-score">
                    {item.score_label}
                  </span>
                </div>

                <p className="recommendation-description">
                  {item.description}
                </p>

                <p className="recommendation-reason">{item.reason}</p>

                <button onClick={() => navigate(item.route)}>
                  Voir le cours
                </button>
              </div>
            ))
          ) : (
            <p>Aucune recommandation personnalisée pour le moment.</p>
          )}
        </div>
      </section>

      <section className="recommendations-section">
        <h2>📈 Continuez votre progression</h2>

        {data.continue_learning ? (
          <div className="recommendation-large-card">
            <div className="recommendation-card-top">
              <h3>{data.continue_learning.title}</h3>
              <span className="recommendation-score">
                {data.continue_learning.progress_label}
              </span>
            </div>

            <p>{data.continue_learning.description}</p>

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(data.continue_learning.progress, 100)}%`,
                }}
              />
            </div>

            <button onClick={() => navigate(data.continue_learning.route)}>
              Continuer
            </button>
          </div>
        ) : (
          <p>Vous n'avez pas encore commencé de parcours.</p>
        )}
      </section>

      <section className="recommendations-section">
        <h2>🎯 Améliorer vos résultats</h2>
        <div className="recommendations-grid">
          {data.improve_results.length > 0 ? (
            data.improve_results.map((item) => (
              <div key={item.course_id} className="recommendation-card">
                <div className="recommendation-card-top">
                  <h3>{item.title}</h3>
                  <span className="recommendation-score weak-score">
                    {item.score_label}
                  </span>
                </div>

                <p>{item.reason}</p>

                <button onClick={() => navigate(item.route)}>
                  {item.action_label || "Voir le cours"}
                </button>
              </div>
            ))
          ) : (
            <p>Aucun point faible détecté récemment.</p>
          )}
        </div>
      </section>

      <section className="recommendations-section">
        <h2>🔥 Cours populaires</h2>
        <div className="recommendations-grid">
          {data.popular_courses.length > 0 ? (
            data.popular_courses.map((item) => (
              <div key={item.course_id} className="recommendation-card">
                <div className="recommendation-card-top">
                  <h3>{item.title}</h3>
                  <span className="recommendation-badge">{item.badge}</span>
                </div>

                <p>{item.description}</p>
                <small>{item.popularity_count} interactions liées</small>

                <button onClick={() => navigate(item.route)}>
                  Voir le cours
                </button>
              </div>
            ))
          ) : (
            <p>Aucun cours populaire disponible.</p>
          )}
        </div>
      </section>
    </section>
  );
}