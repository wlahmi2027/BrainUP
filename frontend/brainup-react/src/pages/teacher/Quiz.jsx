import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FileQuestion,
  BarChart3,
  ClipboardList,
  TrendingUp,
  Medal,
  Eye,
  Pencil,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { fetchTeacherQuizzes } from "../../api/quizzes";
import "../../styles/teacher/quiz.css";

export default function TeacherQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quiz");

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const teacherId = localStorage.getItem("user_id") || 37;

  useEffect(() => {
    async function loadTeacherQuizzes() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchTeacherQuizzes(teacherId);
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement quiz professeur :", error);
        setErrorMessage("Impossible de charger les quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTeacherQuizzes();
  }, [teacherId]);

  const resultsSummary = useMemo(() => {
    if (!quizzes.length) {
      return {
        successRate: "0%",
        globalAverage: "0/20",
        totalAttempts: 0,
      };
    }

    const totalAttempts = quizzes.reduce(
      (sum, quiz) => sum + Number(quiz.tentatives_count || 0),
      0
    );

    const totalSuccess = quizzes.reduce(
      (sum, quiz) => sum + Number(quiz.reussites_count || 0),
      0
    );

    const averageValue =
      quizzes.reduce((sum, quiz) => sum + Number(quiz.moyenne_score || 0), 0) /
      quizzes.length;

    const successRate =
      totalAttempts > 0
        ? `${Math.round((totalSuccess / totalAttempts) * 100)}%`
        : "0%";

    return {
      successRate,
      globalAverage: `${averageValue.toFixed(1)}/20`,
      totalAttempts,
    };
  }, [quizzes]);

  function formatAverage(value) {
    return `${Number(value || 0).toFixed(1)}/20`;
  }

  return (
    <section className="teacher-quiz-page">
      <div className="teacher-quiz-hero">
        <div>
          <div className="teacher-quiz-eyebrow">
            <Sparkles size={14} />
            <span>Évaluation</span>
          </div>

          <h1 className="teacher-quiz-title">Gestion des quiz</h1>
          <p className="teacher-quiz-subtitle">
            Créez, consultez et analysez vos quiz pour suivre les performances
            de vos étudiants.
          </p>
        </div>

        <button
          className="teacher-quiz-create-btn"
          onClick={() => navigate("/teacher/quiz/create")}
          type="button"
        >
          <Plus size={18} />
          <span>Nouveau quiz</span>
        </button>
      </div>

      <div className="teacher-quiz-tabs">
        <button
          className={`teacher-quiz-tab ${activeTab === "quiz" ? "is-active" : ""}`}
          onClick={() => setActiveTab("quiz")}
          type="button"
        >
          <ClipboardList size={16} />
          <span>Mes quiz</span>
        </button>

        <button
          className={`teacher-quiz-tab ${activeTab === "results" ? "is-active" : ""}`}
          onClick={() => setActiveTab("results")}
          type="button"
        >
          <BarChart3 size={16} />
          <span>Résultats</span>
        </button>
      </div>

      {activeTab === "quiz" && (
        <>
          {isLoading && (
            <div className="teacher-quiz-grid">
              {[1, 2, 3].map((item) => (
                <article
                  key={item}
                  className="teacher-quiz-card teacher-quiz-card--skeleton"
                >
                  <div className="teacher-quiz-skeleton teacher-quiz-skeleton--title" />
                  <div className="teacher-quiz-skeleton teacher-quiz-skeleton--line" />
                  <div className="teacher-quiz-skeleton teacher-quiz-skeleton--line short" />
                </article>
              ))}
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="teacher-quiz-feedback teacher-quiz-feedback--error">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && quizzes.length === 0 && (
            <div className="teacher-quiz-empty">
              <FileQuestion size={24} />
              <div>
                <h3>Aucun quiz pour le moment</h3>
                <p>Commencez par créer votre premier quiz.</p>
              </div>
              <button
                className="teacher-quiz-create-btn"
                onClick={() => navigate("/teacher/quiz/create")}
                type="button"
              >
                <Plus size={18} />
                <span>Créer un quiz</span>
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && quizzes.length > 0 && (
            <div className="teacher-quiz-grid">
              {quizzes.map((quiz) => (
                <article key={quiz.id} className="teacher-quiz-card">
                  <div className="teacher-quiz-card__head">
                    <div className="teacher-quiz-card__icon">
                      <FileQuestion size={20} />
                    </div>

                    <div className="teacher-quiz-card__headtext">
                      <h3>{quiz.titre}</h3>
                      <p>{quiz.cours_title || `Cours #${quiz.cours}`}</p>
                    </div>
                  </div>

                  <div className="teacher-quiz-card__meta">
                    <div className="teacher-quiz-pill">
                      <ClipboardList size={14} />
                      <span>
                        {quiz.questions_count || 0} question
                        {(quiz.questions_count || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="teacher-quiz-pill">
                      <BarChart3 size={14} />
                      <span>
                        {quiz.tentatives_count || 0} tentative
                        {(quiz.tentatives_count || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="teacher-quiz-pill">
                      <Medal size={14} />
                      <span>Moyenne {formatAverage(quiz.moyenne_score)}</span>
                    </div>
                  </div>

                  <div className="teacher-quiz-card__actions">
                    <button
                      className="teacher-quiz-btn teacher-quiz-btn--ghost"
                      onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
                      type="button"
                    >
                      <Pencil size={16} />
                      <span>Modifier</span>
                    </button>

                    <button
                      className="teacher-quiz-btn teacher-quiz-btn--primary"
                      onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
                      type="button"
                    >
                      <Eye size={16} />
                      <span>Voir</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "results" && (
        <div className="teacher-quiz-results">
          <div className="teacher-quiz-kpis">
            <div className="teacher-quiz-kpi">
              <div className="teacher-quiz-kpi__icon teacher-quiz-kpi__icon--blue">
                <TrendingUp size={18} />
              </div>
              <div>
                <strong>{resultsSummary.successRate}</strong>
                <span>Taux de réussite</span>
              </div>
            </div>

            <div className="teacher-quiz-kpi">
              <div className="teacher-quiz-kpi__icon teacher-quiz-kpi__icon--purple">
                <Medal size={18} />
              </div>
              <div>
                <strong>{resultsSummary.globalAverage}</strong>
                <span>Moyenne générale</span>
              </div>
            </div>

            <div className="teacher-quiz-kpi">
              <div className="teacher-quiz-kpi__icon teacher-quiz-kpi__icon--orange">
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>{resultsSummary.totalAttempts}</strong>
                <span>Tentatives totales</span>
              </div>
            </div>
          </div>

          {quizzes.length > 0 ? (
            <div className="teacher-quiz-results-list">
              {quizzes.map((quiz) => (
                <article key={quiz.id} className="teacher-quiz-result-row">
                  <div className="teacher-quiz-result-row__left">
                    <div className="teacher-quiz-result-row__icon">
                      <FileQuestion size={18} />
                    </div>

                    <div>
                      <h3>{quiz.titre}</h3>
                      <p>{quiz.cours_title || `Cours #${quiz.cours}`}</p>
                    </div>
                  </div>

                  <div className="teacher-quiz-result-row__right">
                    <div className="teacher-quiz-pill">
                      <span>
                        {quiz.tentatives_count || 0} tentative
                        {(quiz.tentatives_count || 0) > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="teacher-quiz-pill">
                      <span>Moyenne {formatAverage(quiz.moyenne_score)}</span>
                    </div>

                    <button
                      className="teacher-quiz-btn teacher-quiz-btn--primary"
                      onClick={() => navigate(`/teacher/quiz/${quiz.id}/results`)}
                      type="button"
                    >
                      <span>Voir détails</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="teacher-quiz-empty">
              <BarChart3 size={24} />
              <div>
                <h3>Aucun résultat disponible</h3>
                <p>Les statistiques apparaîtront lorsque des étudiants répondront aux quiz.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}