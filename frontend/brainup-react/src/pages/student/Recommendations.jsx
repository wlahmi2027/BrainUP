import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../../api/recommendations";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Flame,
  BookOpen,
  PlayCircle,
} from "lucide-react";
import "../../styles/student/recommendations.css";

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
      <section className="student-reco-page">
        <div className="student-reco-head">
          <div>
            <span className="student-reco-eyebrow">Recommandations</span>
            <h1 className="student-reco-title">Suggestions personnalisées</h1>
            <p className="student-reco-subtitle">
              Chargement de vos recommandations...
            </p>
          </div>
        </div>

        <div className="student-reco-grid">
          <div className="student-reco-skeleton student-reco-skeleton--wide" />
          <div className="student-reco-skeleton" />
          <div className="student-reco-skeleton" />
          <div className="student-reco-skeleton" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="student-reco-page">
        <div className="student-reco-head">
          <div>
            <span className="student-reco-eyebrow">Recommandations</span>
            <h1 className="student-reco-title">Suggestions personnalisées</h1>
            <p className="student-reco-subtitle student-reco-error">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="student-reco-page">
      <div className="student-reco-head">
        <div>
          <span className="student-reco-eyebrow">Recommandations</span>
          <h1 className="student-reco-title">Suggestions personnalisées</h1>
          <p className="student-reco-subtitle">
            Découvrez des cours suggérés selon votre profil, vos résultats et
            votre progression.
          </p>
        </div>

        <div className="student-reco-live-badge">
          <Sparkles size={16} />
          Personnalisé pour vous
        </div>
      </div>

      <section className="student-reco-section">
        <div className="student-reco-section__head">
          <div className="student-reco-section__titlewrap">
            <div className="student-reco-section__icon student-reco-section__icon--blue">
              <Sparkles size={18} />
            </div>
            <div>
              <h2>Recommandé pour vous</h2>
              <p>Des cours alignés sur votre profil et votre activité.</p>
            </div>
          </div>
        </div>

        {data.recommended_for_you.length > 0 ? (
          <div className="student-reco-cards">
            {data.recommended_for_you.map((item) => (
              <article key={item.course_id} className="student-reco-card">
                <div className="student-reco-card__top">
                  <h3>{item.title}</h3>
                  <span className="student-reco-chip student-reco-chip--blue">
                    {item.score_label}
                  </span>
                </div>

                <p className="student-reco-card__desc">{item.description}</p>
                <p className="student-reco-card__reason">{item.reason}</p>

                <button
                  className="student-reco-card__btn"
                  onClick={() => navigate(item.route)}
                >
                  <span>Voir le cours</span>
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="student-reco-empty">
            Aucune recommandation personnalisée pour le moment.
          </div>
        )}
      </section>

      <section className="student-reco-section">
        <div className="student-reco-section__head">
          <div className="student-reco-section__titlewrap">
            <div className="student-reco-section__icon student-reco-section__icon--green">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2>Continuez votre progression</h2>
              <p>Reprenez là où vous vous êtes arrêté.</p>
            </div>
          </div>
        </div>

        {data.continue_learning ? (
          <div className="student-reco-continue">
            <div className="student-reco-continue__content">
              <span className="student-reco-continue__pill">En cours</span>
              <h3>{data.continue_learning.title}</h3>
              <p>{data.continue_learning.description}</p>

              <div className="student-reco-progress">
                <div className="student-reco-progress__top">
                  <span>Progression</span>
                  <span>{data.continue_learning.progress_label}</span>
                </div>
                <div className="student-reco-progress__bar">
                  <div
                    className="student-reco-progress__fill"
                    style={{
                      width: `${Math.min(
                        data.continue_learning.progress || 0,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              className="student-reco-continue__btn"
              onClick={() => navigate(data.continue_learning.route)}
            >
              <PlayCircle size={16} />
              <span>Continuer</span>
            </button>
          </div>
        ) : (
          <div className="student-reco-empty">
            Vous n'avez pas encore de progression à reprendre.
          </div>
        )}
      </section>

      <section className="student-reco-section">
        <div className="student-reco-section__head">
          <div className="student-reco-section__titlewrap">
            <div className="student-reco-section__icon student-reco-section__icon--orange">
              <Target size={18} />
            </div>
            <div>
              <h2>Améliorer vos résultats</h2>
              <p>Des pistes utiles pour renforcer vos points faibles.</p>
            </div>
          </div>
        </div>

        {data.improve_results.length > 0 ? (
          <div className="student-reco-cards">
            {data.improve_results.map((item) => (
              <article key={item.course_id} className="student-reco-card">
                <div className="student-reco-card__top">
                  <h3>{item.title}</h3>
                  <span className="student-reco-chip student-reco-chip--orange">
                    {item.score_label}
                  </span>
                </div>

                <p className="student-reco-card__reason">{item.reason}</p>

                <button
                  className="student-reco-card__btn"
                  onClick={() => navigate(item.route)}
                >
                  <span>{item.action_label || "Voir le cours"}</span>
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="student-reco-empty">
            Aucun point faible détecté récemment.
          </div>
        )}
      </section>

      <section className="student-reco-section">
        <div className="student-reco-section__head">
          <div className="student-reco-section__titlewrap">
            <div className="student-reco-section__icon student-reco-section__icon--red">
              <Flame size={18} />
            </div>
            <div>
              <h2>Cours populaires</h2>
              <p>Les contenus les plus consultés du moment.</p>
            </div>
          </div>
        </div>

        {data.popular_courses.length > 0 ? (
          <div className="student-reco-cards">
            {data.popular_courses.map((item) => (
              <article key={item.course_id} className="student-reco-card">
                <div className="student-reco-card__top">
                  <h3>{item.title}</h3>
                  <span className="student-reco-chip student-reco-chip--neutral">
                    {item.badge}
                  </span>
                </div>

                <p className="student-reco-card__desc">{item.description}</p>

                <div className="student-reco-card__meta">
                  <BookOpen size={14} />
                  <span>{item.popularity_count} interactions liées</span>
                </div>

                <button
                  className="student-reco-card__btn"
                  onClick={() => navigate(item.route)}
                >
                  <span>Voir le cours</span>
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="student-reco-empty">
            Aucun cours populaire disponible.
          </div>
        )}
      </section>
    </section>
  );
}