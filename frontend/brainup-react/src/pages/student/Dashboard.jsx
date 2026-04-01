import { useEffect, useMemo, useState } from "react";
import { fetchStudentDashboard } from "../../api/dashboard";
import {
  BookOpen,
  CircleCheckBig,
  Clock3,
  Trophy,
  Activity,
  CheckCircle2,
  XCircle,
  PlayCircle,
  GraduationCap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import "../../styles/student/dashboard.css";

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await fetchStudentDashboard();
        setDashboard(data);
      } catch (error) {
        console.error("Erreur chargement dashboard étudiant :", error);
        setErrorMessage("Impossible de charger le tableau de bord.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const coursesProgress = dashboard?.courses_progress || [];
  const bestQuizScores = dashboard?.best_quiz_scores || [];
  const recentActivity = dashboard?.recent_activity || [];

  const circleStyle = useMemo(() => {
    if (!dashboard) {
      return {
        background: "conic-gradient(#e8eefc 0deg, #e8eefc 360deg)",
      };
    }

    const coursPart = (dashboard.cours_score || 0) * 0.5;
    const quizPart = (dashboard.quiz_score || 0) * 0.35;
    const tempsPart = (dashboard.temps_score || 0) * 0.15;

    const coursDeg = (coursPart / 100) * 360;
    const quizDeg = (quizPart / 100) * 360;
    const tempsDeg = (tempsPart / 100) * 360;

    const s1 = coursDeg;
    const s2 = coursDeg + quizDeg;
    const s3 = coursDeg + quizDeg + tempsDeg;

    return {
      background: `conic-gradient(
        #2f6fed 0deg ${s1}deg,
        #27ae60 ${s1}deg ${s2}deg,
        #f39c12 ${s2}deg ${s3}deg,
        #e8eefc ${s3}deg 360deg
      )`,
    };
  }, [dashboard]);

  function getActivityIcon(type) {
    switch (type) {
      case "quiz_reussi":
        return <CheckCircle2 size={18} />;
      case "quiz_echoue":
        return <XCircle size={18} />;
      case "cours_demarre":
        return <PlayCircle size={18} />;
      case "cours_termine":
        return <GraduationCap size={18} />;
      case "lecon_consultee":
        return <BookOpen size={18} />;
      case "session_etude":
        return <Clock3 size={18} />;
      default:
        return <Activity size={18} />;
    }
  }

  function getActivityColor(type) {
    switch (type) {
      case "quiz_reussi":
        return "is-success";
      case "quiz_echoue":
        return "is-danger";
      case "cours_demarre":
        return "is-warning";
      case "cours_termine":
        return "is-primary";
      case "lecon_consultee":
        return "is-purple";
      case "session_etude":
        return "is-teal";
      default:
        return "is-neutral";
    }
  }

  if (isLoading) {
    return (
      <section className="student-dashboard-page">
        <div className="student-dashboard-head">
          <div>
            <span className="student-dashboard-eyebrow">Étudiant</span>
            <h1 className="student-dashboard-title">Tableau de bord</h1>
            <p className="student-dashboard-subtitle">
              Chargement de votre espace...
            </p>
          </div>
        </div>

        <div className="student-dashboard-skeleton-grid">
          <div className="student-skeleton student-skeleton--hero" />
          <div className="student-skeleton" />
          <div className="student-skeleton" />
          <div className="student-skeleton student-skeleton--wide" />
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="student-dashboard-page">
        <div className="student-dashboard-head">
          <div>
            <span className="student-dashboard-eyebrow">Étudiant</span>
            <h1 className="student-dashboard-title">Tableau de bord</h1>
            <p className="student-dashboard-subtitle student-dashboard-error">
              {errorMessage}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="student-dashboard-page">
        <div className="student-dashboard-head">
          <div>
            <span className="student-dashboard-eyebrow">Étudiant</span>
            <h1 className="student-dashboard-title">Tableau de bord</h1>
            <p className="student-dashboard-subtitle">
              Aucune donnée disponible.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="student-dashboard-page">
      <div className="student-dashboard-head">
        <div>
          <span className="student-dashboard-eyebrow">Étudiant</span>
          <h1 className="student-dashboard-title">Tableau de bord étudiant</h1>
          <p className="student-dashboard-subtitle">
            Vue synthétique intelligente de votre progression.
          </p>
        </div>

        <div className="student-dashboard-live-badge">
          <Sparkles size={16} />
          Données à jour
        </div>
      </div>

      <div className="student-dashboard-grid">
        <div className="student-panel student-panel--hero">
          <div className="student-hero">
            <div className="student-hero__left">
              <div className="student-panel__head student-panel__head--compact">
                <div>
                  <h2 className="student-panel__title">Ma progression globale</h2>
                  <p className="student-panel__subtitle">
                    Score global pondéré basé sur cours, quiz et temps d'étude.
                  </p>
                </div>
              </div>

              <div className="student-progress-wrap">
                <div className="student-progress-circle" style={circleStyle}>
                  <div className="student-progress-circle__inner">
                    <div className="student-progress-circle__value">
                      {dashboard.score_global}%
                    </div>
                    <div className="student-progress-circle__label">
                      Score global
                    </div>
                  </div>
                </div>
              </div>

              <div className="student-legend">
                <div className="student-legend-item">
                  <span
                    className="student-legend-color"
                    style={{ background: "#2f6fed" }}
                  />
                  <span>Cours ({dashboard.cours_score}%)</span>
                </div>

                <div className="student-legend-item">
                  <span
                    className="student-legend-color"
                    style={{ background: "#27ae60" }}
                  />
                  <span>Quiz ({dashboard.quiz_score}%)</span>
                </div>

                <div className="student-legend-item">
                  <span
                    className="student-legend-color"
                    style={{ background: "#f39c12" }}
                  />
                  <span>Temps ({dashboard.temps_score}%)</span>
                </div>
              </div>
            </div>

            <div className="student-hero__right">
              <div className="student-kpi-card student-kpi-card--primary">
                <div className="student-kpi-card__icon">
                  <BookOpen size={18} />
                </div>
                <div className="student-kpi-card__body">
                  <div className="student-kpi-card__label">Cours terminés</div>
                  <div className="student-kpi-card__value">
                    {dashboard.cours_termines}/{dashboard.total_cours}
                  </div>
                  <div className="student-kpi-card__meta">
                    Progression moyenne : {dashboard.cours_score}%
                  </div>
                </div>
              </div>

              <div className="student-kpi-card student-kpi-card--success">
                <div className="student-kpi-card__icon">
                  <CircleCheckBig size={18} />
                </div>
                <div className="student-kpi-card__body">
                  <div className="student-kpi-card__label">Quiz réussis</div>
                  <div className="student-kpi-card__value">
                    {dashboard.quiz_reussis}/{dashboard.quiz_passes}
                  </div>
                  <div className="student-kpi-card__meta">
                    Validation quiz : {dashboard.quiz_score}%
                  </div>
                </div>
              </div>

              <div className="student-kpi-card student-kpi-card--warning">
                <div className="student-kpi-card__icon">
                  <Clock3 size={18} />
                </div>
                <div className="student-kpi-card__body">
                  <div className="student-kpi-card__label">Temps d'étude</div>
                  <div className="student-kpi-card__value">
                    {dashboard.temps_reel_minutes} min
                  </div>
                  <div className="student-kpi-card__meta">
                    Temps estimé : {dashboard.temps_estime_total_minutes} min
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="student-panel">
          <div className="student-panel__head">
            <div>
              <h2 className="student-panel__title">Progression par cours</h2>
              <p className="student-panel__subtitle">
                Suivi détaillé de vos cours inscrits.
              </p>
            </div>
          </div>

          <div className="student-course-list">
            {coursesProgress.length === 0 ? (
              <div className="student-empty-box">
                Aucun cours inscrit pour le moment.
              </div>
            ) : (
              coursesProgress.map((course) => (
                <div key={course.id} className="student-course-item">
                  <div className="student-course-item__top">
                    <div>
                      <div className="student-course-item__title">{course.title}</div>
                      <div className="student-course-item__meta">
                        {course.completed ? "Cours terminé" : "Cours en cours"}
                      </div>
                    </div>

                    <div className="student-course-item__percent">
                      {course.progress}%
                    </div>
                  </div>

                  <div className="student-progress-bar">
                    <div
                      className="student-progress-bar__fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="student-panel">
          <div className="student-panel__head">
            <div>
              <h2 className="student-panel__title">Meilleurs scores de quiz</h2>
              <p className="student-panel__subtitle">
                Vos quiz les plus performants récemment.
              </p>
            </div>
          </div>

          <div className="student-score-list">
            {bestQuizScores.length === 0 ? (
              <div className="student-empty-box">
                Aucun quiz passé pour le moment.
              </div>
            ) : (
              bestQuizScores.map((quiz) => (
                <div key={quiz.id} className="student-score-item">
                  <div className="student-score-item__badge">{quiz.code}</div>

                  <div className="student-score-item__body">
                    <div className="student-score-item__title">{quiz.title}</div>
                    <div className="student-score-item__meta">
                      {quiz.date_label}
                    </div>
                  </div>

                  <div className="student-score-item__value">
                    {quiz.score}
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="student-panel student-panel--wide">
          <div className="student-panel__head">
            <div>
              <h2 className="student-panel__title">Activité récente</h2>
              <p className="student-panel__subtitle">
                Les dernières actions enregistrées sur votre espace.
              </p>
            </div>
          </div>

          <div className="student-activity-list">
            {recentActivity.length === 0 ? (
              <div className="student-empty-box">
                Aucune activité récente.
              </div>
            ) : (
              recentActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="student-activity-item">
                  <div
                    className={`student-activity-item__icon ${getActivityColor(
                      item.type
                    )}`}
                  >
                    {getActivityIcon(item.type)}
                  </div>

                  <div className="student-activity-item__body">
                    <div className="student-activity-item__title">{item.title}</div>
                    <div className="student-activity-item__meta">
                      {item.meta} • {item.date_label}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}