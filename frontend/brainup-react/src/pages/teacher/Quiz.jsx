import { useMemo, useState } from "react";

export default function Quiz() {
  const [activeTab, setActiveTab] = useState("quiz");

  const quizzes = useMemo(
    () => [
      {
        id: 1,
        title: "Quiz Python - Variables",
        course: "Python avancé",
        questions: 10,
        attempts: 34,
        average: "15/20",
      },
      {
        id: 2,
        title: "Quiz React - Hooks",
        course: "React moderne",
        questions: 8,
        attempts: 29,
        average: "16/20",
      },
      {
        id: 3,
        title: "Quiz SQL - Requêtes",
        course: "Bases de données",
        questions: 12,
        attempts: 18,
        average: "13/20",
      },
    ],
    []
  );

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Gestion des quiz</h1>
          <p className="teacher-subtitle">
            Créez des quiz, ajoutez des questions et suivez les résultats.
          </p>
        </div>

        <button className="btn btn--primary">+ Nouveau quiz</button>
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
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="teacher-row teacher-row--card">
              <div>
                <div className="teacher-row__title">{quiz.title}</div>
                <div className="teacher-row__meta">
                  {quiz.course} • {quiz.questions} questions
                </div>
              </div>

              <div className="teacher-row__right">
                <span className="teacher-mini-kpi">
                  {quiz.attempts} tentatives
                </span>
                <span className="teacher-mini-kpi">
                  Moyenne {quiz.average}
                </span>
                <button className="btn btn--ghost">Modifier</button>
                <button className="btn btn--primary">Voir</button>
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
              <div className="teacher-result-box__value">81%</div>
              <div className="teacher-result-box__label">Taux de réussite</div>
            </div>
            <div className="teacher-result-box">
              <div className="teacher-result-box__value">14.8/20</div>
              <div className="teacher-result-box__label">Moyenne générale</div>
            </div>
            <div className="teacher-result-box">
              <div className="teacher-result-box__value">96</div>
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
            <button className="btn btn--primary">+ Ajouter une question</button>
          </div>
        </div>
      )}
    </section>
  );
}