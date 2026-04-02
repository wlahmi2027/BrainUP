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
} from "lucide-react";

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
    if (status === "Excellent") return "teacher-pill teacher-pill--success";
    if (status === "À relancer") return "teacher-pill teacher-pill--warn";
    return "teacher-pill teacher-pill--neutral";
  };

  if (loading) {
    return (
      <section className="page teacher-page">
        <p>Chargement du suivi étudiant...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page teacher-page">
        <p style={{ color: "red" }}>{error}</p>
      </section>
    );
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <button
            className="btn btn--ghost"
            onClick={() => navigate("/teacher/students")}
            style={{ marginBottom: "14px" }}
          >
            <ArrowLeft size={16} />
            Retour aux étudiants
          </button>

          <h1 className="page__title">Suivi étudiant</h1>
          <p className="teacher-subtitle">
            Consultez le détail de la progression et des performances.
          </p>
        </div>
      </div>

      <section className="teacher-student-hero">
        <div className="teacher-student-hero__identity">
          <div className="teacher-student-hero__avatar">{student.initial}</div>

          <div>
            <h2>{student.nom}</h2>
            <div className="teacher-student-hero__meta">
              <span><Mail size={15} /> {student.email}</span>
              <span><GraduationCap size={15} /> {student.statut}</span>
            </div>
          </div>
        </div>

        <div className="teacher-student-hero__stats">
          <div className="teacher-student-hero__stat">
            <span>Progression moyenne</span>
            <strong>{student.progression_moyenne}%</strong>
          </div>

          <div className="teacher-student-hero__stat">
            <span>Moyenne quiz</span>
            <strong>{student.moyenne_quiz}%</strong>
          </div>

          <div className="teacher-student-hero__stat">
            <span>Statut</span>
            <strong className={getStatusClass(student.statut)}>{student.statut}</strong>
          </div>
        </div>
      </section>

      <div className="teacher-student-detail-grid">
        <section className="teacher-detail-card">
          <div className="teacher-detail-card__head">
            <h3><BookOpen size={18} /> Cours suivis</h3>
          </div>

          <div className="teacher-detail-list">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.course_id} className="teacher-detail-row">
                  <div>
                    <div className="teacher-detail-row__title">{course.course_title}</div>
                    <div className="teacher-detail-row__meta">
                      Quiz : {course.quiz_count} • Moyenne : {course.quiz_average}%
                    </div>
                  </div>

                  <div className="teacher-detail-row__right">
                    <div className="teacher-progress-bar">
                      <div
                        className="teacher-progress-bar__fill"
                        style={{ width: `${Math.min(course.progression_percent, 100)}%` }}
                      />
                    </div>
                    <span>{course.progression_percent}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun cours.</p>
            )}
          </div>
        </section>

        <section className="teacher-detail-card">
          <div className="teacher-detail-card__head">
            <h3><ClipboardList size={18} /> Derniers quiz</h3>
          </div>

          <div className="teacher-detail-list">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="teacher-detail-row">
                  <div>
                    <div className="teacher-detail-row__title">{quiz.quiz_title}</div>
                    <div className="teacher-detail-row__meta">
                      {quiz.course_title} • {quiz.date_label}
                    </div>
                  </div>

                  <div className="teacher-detail-score">
                    {quiz.pourcentage}%
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun quiz enregistré.</p>
            )}
          </div>
        </section>
      </div>

      <section className="teacher-detail-card" style={{ marginTop: "18px" }}>
        <div className="teacher-detail-card__head">
          <h3><Activity size={18} /> Activité récente</h3>
        </div>

        <div className="teacher-activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="teacher-activity-item">
                <div className="teacher-activity-item__dot" />
                <div className="teacher-activity-item__content">
                  <div className="teacher-activity-item__title">{activity.title}</div>
                  <div className="teacher-activity-item__meta">
                    {activity.description || "Sans description"} • {activity.date_label}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Aucune activité récente.</p>
          )}
        </div>
      </section>
    </section>
  );
}