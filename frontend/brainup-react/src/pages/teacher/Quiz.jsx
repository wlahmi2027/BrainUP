import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeacherQuizzes } from "../../api/quizzes";

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
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Gestion des quiz</h1>
          <p className="teacher-subtitle">
            Créez des quiz, ajoutez des questions et suivez les résultats.
          </p>
        </div>

        <button
          className="btn btn--primary"
          onClick={() => navigate("/teacher/quiz/create")}
        >
          + Nouveau quiz
        </button>
      </div>

      <div className="filters">
        <button
          className={`chip ${activeTab === "quiz" ? "is-active" : ""}`}
          onClick={() => setActiveTab("quiz")}
        >
          📝 Mes quiz
        </button>

        <button
          className={`chip ${activeTab === "results" ? "is-active" : ""}`}
          onClick={() => setActiveTab("results")}
        >
          📊 Résultats
        </button>

        <button
          className={`chip ${activeTab === "questions" ? "is-active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          ❓ Questions
        </button>
      </div>

      {activeTab === "quiz" && (
        <div className="teacher-list teacher-list--space">
          {isLoading && (
            <div className="card card--pad">
              <p>Chargement des quiz...</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="card card--pad">
              <p style={{ color: "#c0392b" }}>{errorMessage}</p>
            </div>
          )}

          {!isLoading && !errorMessage && quizzes.length === 0 && (
            <div className="card card--pad">
              <h2 className="card__title">Aucun quiz pour le moment</h2>
              <p className="teacher-subtitle" style={{ marginTop: 10 }}>
                Commencez par créer votre premier quiz.
              </p>
              <div style={{ marginTop: 16 }}>
                <button
                  className="btn btn--primary"
                  onClick={() => navigate("/teacher/quiz/create")}
                >
                  + Créer un quiz
                </button>
              </div>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            quizzes.map((quiz) => (
              <div key={quiz.id} className="teacher-row teacher-row--card">
                <div>
                  <div className="teacher-row__title">{quiz.titre}</div>
                  <div className="teacher-row__meta">
                    {quiz.cours_title || `Cours #${quiz.cours}`} •{" "}
                    {quiz.questions_count || 0} question
                    {(quiz.questions_count || 0) > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="teacher-row__right">
                  <span className="teacher-mini-kpi">
                    {quiz.tentatives_count || 0} tentative
                    {(quiz.tentatives_count || 0) > 1 ? "s" : ""}
                  </span>

                  <span className="teacher-mini-kpi">
                    Moyenne {formatAverage(quiz.moyenne_score)}
                  </span>

                  <button
                    className="btn btn--ghost"
                    onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
                  >
                    Modifier
                  </button>

                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/teacher/quiz/${quiz.id}`)}
                  >
                    Voir
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "results" && (
        <div className="card card--pad">
          <h2 className="card__title">Résumé des résultats</h2>

          <div className="teacher-results-grid">
            <div className="teacher-result-box">
              <div className="teacher-result-box__value">
                {resultsSummary.successRate}
              </div>
              <div className="teacher-result-box__label">Taux de réussite</div>
            </div>

            <div className="teacher-result-box">
              <div className="teacher-result-box__value">
                {resultsSummary.globalAverage}
              </div>
              <div className="teacher-result-box__label">Moyenne générale</div>
            </div>

            <div className="teacher-result-box">
              <div className="teacher-result-box__value">
                {resultsSummary.totalAttempts}
              </div>
              <div className="teacher-result-box__label">
                Tentatives totales
              </div>
            </div>
          </div>

          {quizzes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="teacher-row teacher-row--card"
                  style={{ marginTop: 12 }}
                >
                  <div>
                    <div className="teacher-row__title">{quiz.titre}</div>
                    <div className="teacher-row__meta">
                      {quiz.cours_title || `Cours #${quiz.cours}`}
                    </div>
                  </div>

                  <div className="teacher-row__right">
                    <span className="teacher-mini-kpi">
                      {quiz.tentatives_count || 0} tentative
                      {(quiz.tentatives_count || 0) > 1 ? "s" : ""}
                    </span>

                    <span className="teacher-mini-kpi">
                      Moyenne {formatAverage(quiz.moyenne_score)}
                    </span>

                    <button
                      className="btn btn--primary"
                      onClick={() => navigate(`/teacher/quiz/${quiz.id}/results`)}
                    >
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "questions" && (
        <div className="card card--pad">
          <h2 className="card__title">Banque de questions</h2>
          <p className="teacher-subtitle" style={{ marginTop: 10 }}>
            Vous pourrez ici ajouter, modifier et organiser les questions de vos
            quiz.
          </p>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn btn--primary"
              onClick={() => navigate("/teacher/quiz/create")}
            >
              + Ajouter une question
            </button>
          </div>
        </div>
      )}
    </section>
  );
}