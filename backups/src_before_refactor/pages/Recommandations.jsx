import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../api/recommendations";

export default function Recommandations() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Temporaire pour ne pas casser le login de ton binôme
      const userId = 1;

      const payload = await getRecommendations(userId);
      setData(payload);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les recommandations.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <h1>Recommandations</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="recommendations-page">
        <h1>Recommandations</h1>
        <p>{error || "Impossible de charger les recommandations."}</p>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Recommandations</h1>
        <p>Découvrez des cours suggérés selon votre profil, vos résultats et votre progression.</p>
      </div>

      <section className="recommendations-section">
        <h2>⭐ Recommandé pour vous</h2>
        <div className="recommendations-grid">
          {data.recommended_for_you.length > 0 ? (
            data.recommended_for_you.map((item) => (
              <div key={item.course_id} className="recommendation-card">
                <div className="recommendation-card-top">
                  <h3>{item.title}</h3>
                  <span className="recommendation-score">{item.score_label}</span>
                </div>
                <p className="recommendation-description">{item.description}</p>
                <p className="recommendation-reason">{item.reason}</p>
                <button onClick={() => navigate(item.route)}>Voir</button>
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
              <span className="recommendation-score">{data.continue_learning.progress_label}</span>
            </div>
            <p>{data.continue_learning.description}</p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(data.continue_learning.progress, 100)}%` }}
              />
            </div>
            <button onClick={() => navigate(data.continue_learning.route)}>Continuer</button>
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
                  <span className="recommendation-score weak-score">{item.score_label}</span>
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
                <button onClick={() => navigate(item.route)}>Voir le cours</button>
              </div>
            ))
          ) : (
            <p>Aucun cours populaire disponible.</p>
          )}
        </div>
      </section>
    </div>
  );
}