import { useMemo } from "react";

export default function StudentsResults() {
  const studentsResults = useMemo(
    () => [
      {
        id: 1,
        name: "Amine K.",
        course: "React moderne",
        quiz: "Quiz Hooks",
        score: "18/20",
        average: "16/20",
        progress: 78,
      },
      {
        id: 2,
        name: "Sarah B.",
        course: "Python avancé",
        quiz: "Quiz Variables",
        score: "12/20",
        average: "13/20",
        progress: 55,
      },
      {
        id: 3,
        name: "Nour D.",
        course: "Bases de données",
        quiz: "Quiz SQL",
        score: "19/20",
        average: "17/20",
        progress: 91,
      },
      {
        id: 4,
        name: "Yassine M.",
        course: "React moderne",
        quiz: "Quiz Components",
        score: "9/20",
        average: "11/20",
        progress: 34,
      },
    ],
    []
  );

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Résultats par étudiant</h1>
          <p className="teacher-subtitle">
            Consultez les notes, les progrès et les performances individuelles.
          </p>
        </div>
      </div>

      <div className="teacher-results-cards">
        {studentsResults.map((item) => (
          <article key={item.id} className="teacher-student-result-card">
            <div className="teacher-student-result-card__top">
              <div className="teacher-student-user">
                <div className="teacher-student-avatar">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div className="teacher-row__title">{item.name}</div>
                  <div className="teacher-row__meta">{item.course}</div>
                </div>
              </div>

              <span className="teacher-badge teacher-badge--success">
                {item.score}
              </span>
            </div>

            <div className="teacher-student-result-card__body">
              <div className="teacher-result-line">
                <span>Quiz</span>
                <strong>{item.quiz}</strong>
              </div>

              <div className="teacher-result-line">
                <span>Moyenne globale</span>
                <strong>{item.average}</strong>
              </div>

              <div className="teacher-result-line">
                <span>Progression</span>
                <strong>{item.progress}%</strong>
              </div>

              <div className="teacher-progress-bar">
                <div
                  className="teacher-progress-bar__fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>

            <div className="teacher-student-result-card__actions">
              <button className="btn btn--ghost">Voir détail</button>
              <button className="btn btn--primary">Contacter</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}