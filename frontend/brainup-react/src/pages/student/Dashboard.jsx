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
} from "lucide-react";

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
        return "#27ae60";
      case "quiz_echoue":
        return "#e74c3c";
      case "cours_demarre":
        return "#f39c12";
      case "cours_termine":
        return "#2f6fed";
      case "lecon_consultee":
        return "#8e44ad";
      case "session_etude":
        return "#16a085";
      default:
        return "#7f8c8d";
    }
  }

  if (isLoading) {
    return (
      <section className="page student-page">
        <p>Chargement du tableau de bord...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="page student-page">
        <p style={{ color: "#c0392b" }}>{errorMessage}</p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="page student-page">
        <p>Aucune donnée disponible.</p>
      </section>
    );
  }

  return (
    <section className="page student-page student-dashboard">
      <div className="teacher-head fade-in">
        <div>
          <h1 className="page__title">Tableau de bord étudiant</h1>
          <p className="teacher-subtitle">
            Vue synthétique intelligente de votre progression.
          </p>
        </div>
      </div>

      <div className="student-dashboard-grid">
        <div className="card card--pad student-hero-card fade-in-up">
          <div className="student-hero-left">
            <h2 className="card__title">Ma progression globale</h2>

            <div className="student-progress-wrap">
              <div className="student-progress-circle pulse-soft" style={circleStyle}>
                <div className="student-progress-circle__inner">
                  <div className="student-progress-circle__value">
                    {dashboard.score_global}%
                  </div>
                  <div className="student-progress-circle__label">
                    Score global pondéré
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

          <div className="student-hero-right">
            <div className="student-kpi-card hover-lift">
              <div className="student-kpi-card__top">
                <BookOpen size={18} />
                <div className="student-kpi-card__title">Cours terminés</div>
              </div>
              <div className="student-kpi-card__value">
                {dashboard.cours_termines}/{dashboard.total_cours}
              </div>
              <div className="student-kpi-card__meta">
                Progression moyenne : {dashboard.cours_score}%
              </div>
            </div>

            <div className="student-kpi-card hover-lift">
              <div className="student-kpi-card__top">
                <CircleCheckBig size={18} />
                <div className="student-kpi-card__title">Quiz réussis</div>
              </div>
              <div className="student-kpi-card__value">
                {dashboard.quiz_reussis}/{dashboard.quiz_passes}
              </div>
              <div className="student-kpi-card__meta">
                Validation quiz : {dashboard.quiz_score}%
              </div>
            </div>

            <div className="student-kpi-card hover-lift">
              <div className="student-kpi-card__top">
                <Clock3 size={18} />
                <div className="student-kpi-card__title">Temps d'étude</div>
              </div>
              <div className="student-kpi-card__value">
                {dashboard.temps_reel_minutes} min
              </div>
              <div className="student-kpi-card__meta">
                Temps estimé : {dashboard.temps_estime_total_minutes} min
              </div>
            </div>
          </div>
        </div>

        <div className="card card--pad fade-in-up">
          <h2 className="card__title section-title-with-icon">
            <BookOpen size={18} />
            <span>Progression par cours</span>
          </h2>

          <div className="student-list">
            {coursesProgress.length === 0 ? (
              <p className="teacher-subtitle" style={{ marginTop: 12 }}>
                Aucun cours inscrit pour le moment.
              </p>
            ) : (
              coursesProgress.map((course) => (
                <div key={course.id} className="student-list-item hover-lift">
                  <div className="student-list-item__top">
                    <span className="student-list-item__title">{course.title}</span>
                    <span className="student-list-item__value">
                      {course.progress}%
                    </span>
                  </div>

                  <div className="student-progress-bar">
                    <div
                      className="student-progress-bar__fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <div className="student-list-item__meta">
                    {course.completed ? "✅ Terminé" : "📘 En cours"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card card--pad fade-in-up">
          <h2 className="card__title section-title-with-icon">
            <Trophy size={18} />
            <span>Meilleurs scores de quiz</span>
          </h2>

          <div className="student-list">
            {bestQuizScores.length === 0 ? (
              <p className="teacher-subtitle" style={{ marginTop: 12 }}>
                Aucun quiz passé pour le moment.
              </p>
            ) : (
              bestQuizScores.map((quiz) => (
                <div key={quiz.id} className="student-score-item hover-lift">
                  <div className="student-score-badge">{quiz.code}</div>

                  <div className="student-score-content">
                    <div className="student-score-content__title">{quiz.title}</div>
                    <div className="student-score-content__meta">{quiz.date_label}</div>
                  </div>

                  <div className="student-score-value">{quiz.score}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card card--pad student-activity-card fade-in-up">
          <h2 className="card__title section-title-with-icon">
            <Activity size={18} />
            <span>Activité récente</span>
          </h2>

          <div className="student-list">
            {recentActivity.length === 0 ? (
              <p className="teacher-subtitle" style={{ marginTop: 12 }}>
                Aucune activité récente.
              </p>
            ) : (
              recentActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="student-activity-item hover-lift">
                  <div
                    className="student-activity-icon"
                    style={{ color: getActivityColor(item.type) }}
                  >
                    {getActivityIcon(item.type)}
                  </div>

                  <div className="student-activity-content">
                    <div className="student-activity-content__title">{item.title}</div>
                    <div className="student-activity-content__meta">
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