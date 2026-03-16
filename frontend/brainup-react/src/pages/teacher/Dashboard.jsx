import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const stats = useMemo(
    () => [
      { label: "Cours créés", value: 6, icon: "📚" },
      { label: "Quiz publiés", value: 14, icon: "📝" },
      { label: "Étudiants inscrits", value: 128, icon: "👨‍🎓" },
      { label: "Taux moyen de réussite", value: "82%", icon: "📈" },
    ],
    []
  );

  const recentCourses = useMemo(
    () => [
      {
        id: 1,
        title: "Python avancé",
        students: 34,
        quizzes: 3,
        status: "Publié",
      },
      {
        id: 2,
        title: "React moderne",
        students: 41,
        quizzes: 4,
        status: "Publié",
      },
      {
        id: 3,
        title: "Bases de données",
        students: 22,
        quizzes: 2,
        status: "Brouillon",
      },
    ],
    []
  );

  const alerts = useMemo(
    () => [
      "3 quiz n’ont pas encore été corrigés automatiquement.",
      "Le cours “Bases de données” n’est pas encore publié.",
      "12 nouveaux étudiants se sont inscrits cette semaine.",
    ],
    []
  );

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Dashboard enseignant</h1>
          <p className="teacher-subtitle">
            Gérez vos cours, quiz et le suivi des étudiants.
          </p>
        </div>
      </div>

      <div className="teacher-stats">
        {stats.map((item, index) => (
          <article key={index} className="teacher-stat-card">
            <div className="teacher-stat-card__icon">{item.icon}</div>
            <div>
              <div className="teacher-stat-card__value">{item.value}</div>
              <div className="teacher-stat-card__label">{item.label}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="teacher-grid">
        <section className="card card--pad">
          <div className="card__head">
            <h2 className="card__title">Mes cours récents</h2>
            <Link className="tinyLink" to="/teacher/courses">
              Voir tout
            </Link>
          </div>

          <div className="teacher-list">
            {recentCourses.map((course) => (
              <div key={course.id} className="teacher-row">
                <div>
                  <div className="teacher-row__title">{course.title}</div>
                  <div className="teacher-row__meta">
                    {course.students} étudiants • {course.quizzes} quiz
                  </div>
                </div>

                <div className="teacher-row__right">
                  <span
                    className={`teacher-badge ${
                      course.status === "Publié"
                        ? "teacher-badge--success"
                        : "teacher-badge--warn"
                    }`}
                  >
                    {course.status}
                  </span>
                  <button className="btn btn--ghost">Gérer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card card--pad">
          <div className="card__head">
            <h2 className="card__title">Notifications</h2>
            <span className="dots">•••</span>
          </div>

          <div className="teacher-alerts">
            {alerts.map((alert, index) => (
              <div key={index} className="teacher-alert">
                <span className="teacher-alert__icon">🔔</span>
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}