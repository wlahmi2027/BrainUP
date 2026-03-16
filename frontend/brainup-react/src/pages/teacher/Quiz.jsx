import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quiz");

  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const teacherId = 37;

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `http://127.0.0.1:8001/api/quiz/?enseignant=${teacherId}`
        );

        console.log("GET /api/quiz/ status =", response.status);

        if (!response.ok) {
          throw new Error("Impossible de charger les quiz.");
        }

        const data = await response.json();
        console.log("QUIZZES DATA =", data);

        setQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement quiz :", error);
        setErrorMessage("Impossible de charger les quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  const resultsSummary = useMemo(() => {
    if (!quizzes.length) {
      return {
        successRate: "0%",
        globalAverage: "0/20",
        totalAttempts: 0,
      };
    }

    const totalAttempts = quizzes.reduce(
      (sum, quiz) => sum + (quiz.tentatives_count || 0),
      0
    );

    const averageValue =
      quizzes.reduce((sum, quiz) => sum + Number(quiz.moyenne_score || 0), 0) /
      quizzes.length;

    return {
      successRate: totalAttempts > 0 ? "—" : "0%",
      globalAverage: `${averageValue.toFixed(1)}/20`,
      totalAttempts,
    };
  }, [quizzes]);

  function formatAverage(value) {
    return `${Number(value || 0)}/20`;
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
                    {(quiz.cours_title || `Cours #${quiz.cours}`)} •{" "}
                    {quiz.questions_count} question
                    {quiz.questions_count > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="teacher-row__right">
                  <span className="teacher-mini-kpi">
                    {quiz.tentatives_count} tentative
                    {quiz.tentatives_count > 1 ? "s" : ""}
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
              <div className="teacher-result-box__label">Tentatives totales</div>
            </div>
          </div>
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