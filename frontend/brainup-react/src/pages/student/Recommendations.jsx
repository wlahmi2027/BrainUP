import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../../api/recommendations";

export default function Recommendations() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    recommended_for_you: [],
    continue_learning: null,
    improve_results: [],
    popular_courses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("user_id");
        const role = localStorage.getItem("role");

        if (!token || !userId) {
          throw new Error("Utilisateur non connecté.");
        }

        if (role !== "etudiant") {
          throw new Error("Accès réservé aux étudiants.");
        }

        const payload = await getRecommendations(userId);

        setData({
          recommended_for_you: payload?.recommended_for_you || [],
          continue_learning: payload?.continue_learning || null,
          improve_results: payload?.improve_results || [],
          popular_courses: payload?.popular_courses || [],
        });
      } catch (err) {
        console.error("Erreur recommandations :", err);
        setError(
          err?.response?.data?.error ||
            err.message ||
            "Impossible de charger les recommandations."
        );
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

  if (error) {
    return (
      <section className="recommendations-page">
        <div className="recommendations-header">
          <h1>Recommandations</h1>
          <p style={{ color: "crimson" }}>{error}</p>
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

                <p className="recommendation-description">{item.description}</p>
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
                  width: `${Math.min(data.continue_learning.progress || 0, 100)}%`,
                }}
              />
            </div>

            <button onClick={() => navigate(data.continue_learning.route)}>
              Continuer
            </button>
          </div>
        ) : (
          <p>Vous n'avez pas encore de progression à reprendre.</p>
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