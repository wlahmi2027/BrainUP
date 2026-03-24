import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BookText,
  CircleAlert,
  ClipboardList,
  FileClock,
  TrendingUp,
  Users,
  BadgeCheck,
} from "lucide-react";
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
        icon: <BookOpen size={22} />,
        iconClass: "teacher-stat-card__icon teacher-stat-card__icon--blue",
      },
      {
        label: "Quiz publiés",
        value: data.stats.published_quizzes_count ?? 0,
        icon: <ClipboardList size={22} />,
        iconClass: "teacher-stat-card__icon teacher-stat-card__icon--purple",
      },
      {
        label: "Étudiants inscrits",
        value: data.stats.students_count ?? 0,
        icon: <Users size={22} />,
        iconClass: "teacher-stat-card__icon teacher-stat-card__icon--orange",
      },
      {
        label: "Taux moyen de réussite",
        value: `${data.stats.average_success_rate ?? 0}%`,
        icon: <TrendingUp size={22} />,
        iconClass: "teacher-stat-card__icon teacher-stat-card__icon--green",
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
    }[status] || "Inconnu";
  };

  const getStatusClass = (status) => {
    if (status === "publie") return "teacher-badge teacher-badge--success";
    if (status === "brouillon") return "teacher-badge teacher-badge--warn";
    return "teacher-badge teacher-badge--muted";
  };

  const getAlertIcon = (type) => {
    if (type === "quiz_pending") return <FileClock size={18} />;
    if (type === "course_draft") return <CircleAlert size={18} />;
    if (type === "new_students") return <Users size={18} />;
    return <Bell size={18} />;
  };

  if (loading) {
    return (
      <section className="page teacher-dashboard-page">
        <div className="teacher-dashboard-head">
          <div>
            <div className="teacher-dashboard-eyebrow">Espace enseignant</div>
            <h1 className="teacher-dashboard-title">Dashboard enseignant</h1>
            <p className="teacher-dashboard-subtitle">Chargement des données...</p>
          </div>
        </div>

        <div className="teacher-stats-grid">
          {[1, 2, 3, 4].map((item) => (
            <article key={item} className="teacher-stat-card teacher-skeleton-card">
              <div className="teacher-skeleton-icon" />
              <div className="teacher-skeleton-content">
                <div className="teacher-skeleton-line teacher-skeleton-line--big" />
                <div className="teacher-skeleton-line" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page teacher-dashboard-page">
        <div className="teacher-dashboard-head">
          <div>
            <div className="teacher-dashboard-eyebrow">Espace enseignant</div>
            <h1 className="teacher-dashboard-title">Dashboard enseignant</h1>
            <p className="teacher-dashboard-subtitle teacher-dashboard-error">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page teacher-dashboard-page">
      <div className="teacher-dashboard-head">
        <div>
          <div className="teacher-dashboard-eyebrow">Espace enseignant</div>
          <h1 className="teacher-dashboard-title">Dashboard enseignant</h1>
          <p className="teacher-dashboard-subtitle">
            Gérez vos cours, quiz et le suivi des étudiants.
          </p>
        </div>

        <div className="teacher-dashboard-live-badge">
          <BadgeCheck size={16} />
          <span>Données en temps réel</span>
        </div>
      </div>

      <div className="teacher-stats-grid">
        {stats.map((item, index) => (
          <article key={index} className="teacher-stat-card">
            <div className={item.iconClass}>{item.icon}</div>

            <div className="teacher-stat-card__content">
              <div className="teacher-stat-card__value">{item.value}</div>
              <div className="teacher-stat-card__label">{item.label}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="teacher-dashboard-grid">
        <section className="teacher-panel">
          <div className="teacher-panel__head">
            <div>
              <h2 className="teacher-panel__title">Mes cours récents</h2>
              <p className="teacher-panel__subtitle">
                Les derniers cours créés ou mis à jour.
              </p>
            </div>

            <Link className="teacher-panel__link" to="/teacher/courses">
              <span>Voir tout</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="teacher-recent-courses">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <article key={course.id} className="teacher-course-card-mini">
                  <div className="teacher-course-card-mini__left">
                    <div className="teacher-course-card-mini__icon">
                      <BookText size={20} />
                    </div>

                    <div className="teacher-course-card-mini__body">
                      <h3 className="teacher-course-card-mini__title">
                        {course.title}
                      </h3>
                      <p className="teacher-course-card-mini__meta">
                        {course.students} étudiants • {course.quizzes} quiz
                      </p>
                    </div>
                  </div>

                  <div className="teacher-course-card-mini__right">
                    <span className={getStatusClass(course.status)}>
                      {getStatusLabel(course.status)}
                    </span>

                    <button
                      className="teacher-manage-btn"
                      onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}
                    >
                      Gérer
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="teacher-empty-box">
                <BookOpen size={18} />
                <span>Aucun cours récent pour le moment.</span>
              </div>
            )}
          </div>
        </section>

        <section className="teacher-panel">
          <div className="teacher-panel__head">
            <div>
              <h2 className="teacher-panel__title">Notifications</h2>
              <p className="teacher-panel__subtitle">
                Alertes générées automatiquement à partir des données.
              </p>
            </div>

            <div className="teacher-notification-counter">
              <Bell size={15} />
              <span>{alerts.length}</span>
            </div>
          </div>

          <div className="teacher-notifications-list">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <article key={index} className="teacher-notification-card">
                  <div className="teacher-notification-card__icon">
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="teacher-notification-card__content">
                    <div className="teacher-notification-card__label">
                      Notification
                    </div>
                    <p className="teacher-notification-card__message">
                      {alert.message}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="teacher-empty-box">
                <Bell size={18} />
                <span>Aucune notification.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}