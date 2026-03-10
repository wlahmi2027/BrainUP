import { useMemo, useState } from "react";

export default function Results() {
  const [selectedCourse, setSelectedCourse] = useState("all");

  const summary = useMemo(
    () => [
      { label: "Quiz actifs", value: 8, icon: "📝" },
      { label: "Tentatives totales", value: 126, icon: "📊" },
      { label: "Moyenne générale", value: "14.8/20", icon: "🎯" },
      { label: "Taux de réussite", value: "81%", icon: "✅" },
    ],
    []
  );

  const quizResults = useMemo(
    () => [
      {
        id: 1,
        course: "React moderne",
        quiz: "Quiz Hooks",
        attempts: 34,
        average: "16.1/20",
        successRate: "88%",
      },
      {
        id: 2,
        course: "Python avancé",
        quiz: "Quiz Variables",
        attempts: 41,
        average: "13.9/20",
        successRate: "74%",
      },
      {
        id: 3,
        course: "Bases de données",
        quiz: "Quiz SQL",
        attempts: 22,
        average: "14.4/20",
        successRate: "79%",
      },
    ],
    []
  );

  const filteredResults = useMemo(() => {
    if (selectedCourse === "all") return quizResults;
    return quizResults.filter((item) => item.course === selectedCourse);
  }, [quizResults, selectedCourse]);

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Résultats des quiz</h1>
          <p className="teacher-subtitle">
            Analysez les performances globales de vos quiz.
          </p>
        </div>

        <div className="seg">
          <button
            className={`seg__btn ${selectedCourse === "all" ? "is-active" : ""}`}
            onClick={() => setSelectedCourse("all")}
          >
            Tous
          </button>
          <button
            className={`seg__btn ${
              selectedCourse === "React moderne" ? "is-active" : ""
            }`}
            onClick={() => setSelectedCourse("React moderne")}
          >
            React
          </button>
          <button
            className={`seg__btn ${
              selectedCourse === "Python avancé" ? "is-active" : ""
            }`}
            onClick={() => setSelectedCourse("Python avancé")}
          >
            Python
          </button>
          <button
            className={`seg__btn ${
              selectedCourse === "Bases de données" ? "is-active" : ""
            }`}
            onClick={() => setSelectedCourse("Bases de données")}
          >
            SQL
          </button>
        </div>
      </div>

      <div className="teacher-stats">
        {summary.map((item, index) => (
          <article key={index} className="teacher-stat-card">
            <div className="teacher-stat-card__icon">{item.icon}</div>
            <div>
              <div className="teacher-stat-card__value">{item.value}</div>
              <div className="teacher-stat-card__label">{item.label}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="teacher-results-list">
        {filteredResults.map((item) => (
          <div key={item.id} className="teacher-result-row">
            <div>
              <div className="teacher-row__title">{item.quiz}</div>
              <div className="teacher-row__meta">{item.course}</div>
            </div>

            <div className="teacher-result-metrics">
              <div className="teacher-result-pill">
                {item.attempts} tentatives
              </div>
              <div className="teacher-result-pill">
                Moyenne {item.average}
              </div>
              <div className="teacher-result-pill teacher-result-pill--success">
                {item.successRate} réussite
              </div>
              <button className="btn btn--primary">Voir détails</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}