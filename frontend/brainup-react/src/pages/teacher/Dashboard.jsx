import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTeacherDashboard } from "../../api/dashboard";

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const payload = await fetchTeacherDashboard();
        setData(payload);
      } catch (err) {
        console.error("Erreur chargement dashboard enseignant :", err);
        setError("Impossible de charger le dashboard enseignant.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    if (!data?.stats) return [];

    return [
      {
        label: "Cours créés",
        value: data.stats.courses_count ?? 0,
        icon: "📚",
      },
      {
        label: "Quiz publiés",
        value: data.stats.published_quizzes_count ?? 0,
        icon: "📝",
      },
      {
        label: "Étudiants inscrits",
        value: data.stats.students_count ?? 0,
        icon: "👨‍🎓",
      },
      {
        label: "Taux moyen de réussite",
        value: `${data.stats.average_success_rate ?? 0}%`,
        icon: "📈",
      },
    ];
  }, [data]);

  const recentCourses = data?.recent_courses || [];
  const alerts = data?.alerts || [];

  const getStatusLabel = (status) => {
    return {
      publie: "Publié",
      brouillon: "Brouillon",
      archive: "Archivé",
    }[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === "publie") return "teacher-badge--success";
    if (status === "brouillon") return "teacher-badge--warn";
    return "teacher-badge--muted";
  };

  if (loading) {
    return (
      <section className="page teacher-page">
        <div className="teacher-head">
          <div>
            <h1 className="page__title">Dashboard enseignant</h1>
            <p className="teacher-subtitle">Chargement des données...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page teacher-page">
        <div className="teacher-head">
          <div>
            <h1 className="page__title">Dashboard enseignant</h1>
            <p className="teacher-subtitle" style={{ color: "red" }}>
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

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
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div key={course.id} className="teacher-row">
                  <div>
                    <div className="teacher-row__title">{course.title}</div>
                    <div className="teacher-row__meta">
                      {course.students} étudiants • {course.quizzes} quiz
                    </div>
                  </div>

                  <div className="teacher-row__right">
                    <span className={`teacher-badge ${getStatusClass(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>
                    <button
                      className="btn btn--ghost"
                      onClick={() => navigate(`/teacher/courses/${course.id}`)}
                    >
                      Gérer
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun cours récent pour le moment.</p>
            )}
          </div>
        </section>

        <section className="card card--pad">
          <div className="card__head">
            <h2 className="card__title">Notifications</h2>
            <span className="dots">•••</span>
          </div>

          <div className="teacher-alerts">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="teacher-alert">
                  <span className="teacher-alert__icon">🔔</span>
                  <span>{alert.message}</span>
                </div>
              ))
            ) : (
              <p>Aucune notification.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}