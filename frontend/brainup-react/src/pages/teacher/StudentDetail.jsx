import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTeacherStudentDetail } from "../../api/teacherStudents";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Activity,
  Mail,
  GraduationCap,
  Sparkles,
  Award,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import "../../styles/teacher/student-detail.css";

export default function StudentDetail() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudentDetail() {
      try {
        setLoading(true);
        setError("");

        const payload = await fetchTeacherStudentDetail(studentId);
        setData(payload);
      } catch (err) {
        console.error("Erreur détail étudiant :", err);
        setError("Impossible de charger le détail de l’étudiant.");
      } finally {
        setLoading(false);
      }
    }

    loadStudentDetail();
  }, [studentId]);

  const student = data?.student;
  const courses = data?.courses || [];
  const quizzes = data?.quizzes || [];
  const recentActivity = data?.recent_activity || [];

  const getStatusClass = (status) => {
    if (status === "Excellent") {
      return "teacher-student-detail-pill teacher-student-detail-pill--success";
    }
    if (status === "À relancer") {
      return "teacher-student-detail-pill teacher-student-detail-pill--warn";
    }
    return "teacher-student-detail-pill teacher-student-detail-pill--neutral";
  };

  if (loading) {
    return (
      <section className="teacher-student-detail-page">
        <div className="teacher-student-detail-loading">
          Chargement du suivi étudiant...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="teacher-student-detail-page">
        <div className="teacher-student-detail-feedback teacher-student-detail-feedback--error">
          {error}
        </div>
      </section>
    );
  }

  if (!student) {
    return (
      <section className="teacher-student-detail-page">
        <div className="teacher-student-detail-feedback teacher-student-detail-feedback--error">
          Étudiant introuvable.
        </div>
      </section>
    );
  }

  return (
    <section className="teacher-student-detail-page">
      <div className="teacher-student-detail-head">
        <div>
          <button
            className="teacher-student-detail-back"
            onClick={() => navigate("/teacher/students")}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Retour aux étudiants</span>
          </button>

          <div className="teacher-student-detail-eyebrow">
            <Sparkles size={14} />
            <span>Suivi détaillé</span>
          </div>

          <h1 className="teacher-student-detail-title">Suivi étudiant</h1>
          <p className="teacher-student-detail-subtitle">
            Consultez la progression, les quiz et l’activité récente de cet
            apprenant.
          </p>
        </div>
      </div>

      <section className="teacher-student-detail-hero">
        <div className="teacher-student-detail-hero__identity">
          <div className="teacher-student-detail-hero__avatar">
            {student.initial}
          </div>

          <div>
            <h2>{student.nom}</h2>

            <div className="teacher-student-detail-hero__meta">
              <span>
                <Mail size={15} />
                {student.email}
              </span>

              <span>
                <GraduationCap size={15} />
                {student.statut}
              </span>
            </div>
          </div>
        </div>

        <div className="teacher-student-detail-hero__stats">
          <div className="teacher-student-detail-hero__stat">
            <span>
              <TrendingUp size={14} />
              Progression moyenne
            </span>
            <strong>{student.progression_moyenne}%</strong>
          </div>

          <div className="teacher-student-detail-hero__stat">
            <span>
              <Award size={14} />
              Moyenne quiz
            </span>
            <strong>{student.moyenne_quiz}%</strong>
          </div>

          <div className="teacher-student-detail-hero__stat">
            <span>
              <GraduationCap size={14} />
              Statut
            </span>
            <div className={getStatusClass(student.statut)}>
              {student.statut}
            </div>
          </div>
        </div>
      </section>

      <div className="teacher-student-detail-grid">
        <section className="teacher-student-detail-card">
          <div className="teacher-student-detail-card__head">
            <h3>
              <BookOpen size={18} />
              Cours suivis
            </h3>
          </div>

          <div className="teacher-student-detail-list">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.course_id}
                  className="teacher-student-detail-row"
                >
                  <div>
                    <div className="teacher-student-detail-row__title">
                      {course.course_title}
                    </div>
                    <div className="teacher-student-detail-row__meta">
                      Quiz : {course.quiz_count} • Moyenne : {course.quiz_average}%
                    </div>
                  </div>

                  <div className="teacher-student-detail-row__right">
                    <div className="teacher-student-detail-progress-bar">
                      <div
                        className="teacher-student-detail-progress-bar__fill"
                        style={{
                          width: `${Math.min(course.progression_percent, 100)}%`,
                        }}
                      />
                    </div>
                    <span>{course.progression_percent}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="teacher-student-detail-empty-inline">
                Aucun cours.
              </div>
            )}
          </div>
        </section>

        <section className="teacher-student-detail-card">
          <div className="teacher-student-detail-card__head">
            <h3>
              <ClipboardList size={18} />
              Derniers quiz
            </h3>
          </div>

          <div className="teacher-student-detail-list">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="teacher-student-detail-row">
                  <div>
                    <div className="teacher-student-detail-row__title">
                      {quiz.quiz_title}
                    </div>
                    <div className="teacher-student-detail-row__meta">
                      {quiz.course_title} • {quiz.date_label}
                    </div>
                  </div>

                  <div className="teacher-student-detail-score">
                    {quiz.pourcentage}%
                  </div>
                </div>
              ))
            ) : (
              <div className="teacher-student-detail-empty-inline">
                Aucun quiz enregistré.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="teacher-student-detail-card teacher-student-detail-card--activity">
        <div className="teacher-student-detail-card__head">
          <h3>
            <Activity size={18} />
            Activité récente
          </h3>
        </div>

        <div className="teacher-student-detail-activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="teacher-student-detail-activity-item"
              >
                <div className="teacher-student-detail-activity-item__dot" />

                <div className="teacher-student-detail-activity-item__content">
                  <div className="teacher-student-detail-activity-item__title">
                    {activity.title}
                  </div>
                  <div className="teacher-student-detail-activity-item__meta">
                    {activity.description || "Sans description"} •{" "}
                    {activity.date_label}
                  </div>
                </div>

                <div className="teacher-student-detail-activity-item__date">
                  <CalendarDays size={14} />
                </div>
              </div>
            ))
          ) : (
            <div className="teacher-student-detail-empty-inline">
              Aucune activité récente.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}