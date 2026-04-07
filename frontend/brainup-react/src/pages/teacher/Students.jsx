import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeacherStudents } from "../../api/teacherStudents";
import {
  Search,
  Users,
  UserCheck,
  TriangleAlert,
  Award,
  ChevronRight,
  Sparkles,
  BookOpen,
  Activity,
} from "lucide-react";
import "../../styles/teacher/students.css";

export default function Students() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        setError("");

        const payload = await fetchTeacherStudents({
          search: search || undefined,
          status: statusFilter || undefined,
          course: courseFilter || undefined,
        });

        setData(payload);
      } catch (err) {
        console.error("Erreur chargement étudiants :", err);
        setError("Impossible de charger les étudiants.");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [search, statusFilter, courseFilter]);

  const summary = data?.summary || {
    total_students: 0,
    active_students: 0,
    excellent_students: 0,
    to_follow_students: 0,
  };

  const students = data?.students || [];
  const coursesFilter = data?.courses_filter || [];

  const getStatusClass = (status) => {
    if (status === "Excellent") {
      return "teacher-students-pill teacher-students-pill--success";
    }
    if (status === "À relancer") {
      return "teacher-students-pill teacher-students-pill--warn";
    }
    return "teacher-students-pill teacher-students-pill--neutral";
  };

  if (loading) {
    return (
      <section className="teacher-students-page">
        <div className="teacher-students-hero">
          <div>
            <div className="teacher-students-eyebrow">
              <Sparkles size={14} />
              <span>Suivi des apprenants</span>
            </div>
            <h1 className="teacher-students-title">Étudiants</h1>
            <p className="teacher-students-subtitle">
              Chargement des étudiants...
            </p>
          </div>
        </div>

        <div className="teacher-students-stats">
          {[1, 2, 3, 4].map((item) => (
            <article key={item} className="teacher-students-stat-card teacher-students-skeleton-card">
              <div className="teacher-students-skeleton teacher-students-skeleton--icon" />
              <div className="teacher-students-skeleton-wrap">
                <div className="teacher-students-skeleton teacher-students-skeleton--value" />
                <div className="teacher-students-skeleton teacher-students-skeleton--label" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="teacher-students-page">
        <div className="teacher-students-hero">
          <div>
            <div className="teacher-students-eyebrow">
              <Sparkles size={14} />
              <span>Suivi des apprenants</span>
            </div>
            <h1 className="teacher-students-title">Étudiants</h1>
            <p className="teacher-students-subtitle teacher-students-subtitle--error">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="teacher-students-page">
      <div className="teacher-students-hero">
        <div>
          <div className="teacher-students-eyebrow">
            <Sparkles size={14} />
            <span>Suivi des apprenants</span>
          </div>

          <h1 className="teacher-students-title">Étudiants</h1>
          <p className="teacher-students-subtitle">
            Suivez vos apprenants, identifiez les profils excellents et repérez
            ceux à relancer.
          </p>
        </div>
      </div>

      <div className="teacher-students-stats">
        <article className="teacher-students-stat-card">
          <div className="teacher-students-stat-card__icon teacher-students-stat-card__icon--blue">
            <Users size={22} />
          </div>
          <div>
            <div className="teacher-students-stat-card__value">
              {summary.total_students}
            </div>
            <div className="teacher-students-stat-card__label">
              Étudiants au total
            </div>
          </div>
        </article>

        <article className="teacher-students-stat-card">
          <div className="teacher-students-stat-card__icon teacher-students-stat-card__icon--green">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="teacher-students-stat-card__value">
              {summary.active_students}
            </div>
            <div className="teacher-students-stat-card__label">Actifs</div>
          </div>
        </article>

        <article className="teacher-students-stat-card">
          <div className="teacher-students-stat-card__icon teacher-students-stat-card__icon--purple">
            <Award size={22} />
          </div>
          <div>
            <div className="teacher-students-stat-card__value">
              {summary.excellent_students}
            </div>
            <div className="teacher-students-stat-card__label">Excellents</div>
          </div>
        </article>

        <article className="teacher-students-stat-card">
          <div className="teacher-students-stat-card__icon teacher-students-stat-card__icon--orange">
            <TriangleAlert size={22} />
          </div>
          <div>
            <div className="teacher-students-stat-card__value">
              {summary.to_follow_students}
            </div>
            <div className="teacher-students-stat-card__label">À relancer</div>
          </div>
        </article>
      </div>

      <div className="teacher-students-toolbar">
        <div className="teacher-students-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="teacher-students-select"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="">Tous les cours</option>
          {coursesFilter.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <select
          className="teacher-students-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Excellent">Excellent</option>
          <option value="À relancer">À relancer</option>
        </select>
      </div>

      <div className="teacher-students-grid">
        {students.length > 0 ? (
          students.map((student) => (
            <article key={student.id} className="teacher-students-card">
              <div className="teacher-students-card__top">
                <div className="teacher-students-card__identity">
                  <div className="teacher-students-card__avatar">
                    {student.initial}
                  </div>

                  <div>
                    <h3 className="teacher-students-card__name">{student.nom}</h3>
                    <p className="teacher-students-card__email">{student.email}</p>
                  </div>
                </div>

                <span className={getStatusClass(student.statut)}>
                  {student.statut}
                </span>
              </div>

              <div className="teacher-students-card__metrics">
                <div className="teacher-students-card__metric">
                  <span>
                    <BookOpen size={14} />
                    Cours suivis
                  </span>
                  <strong>{student.courses.length}</strong>
                </div>

                <div className="teacher-students-card__metric">
                  <span>
                    <Award size={14} />
                    Moyenne quiz
                  </span>
                  <strong>{student.moyenne_quiz}%</strong>
                </div>
              </div>

              <div className="teacher-students-card__progress">
                <div className="teacher-students-card__progress-top">
                  <span>
                    <Activity size={14} />
                    Progression moyenne
                  </span>
                  <strong>{student.progression_moyenne}%</strong>
                </div>

                <div className="teacher-students-progress-bar teacher-students-progress-bar--large">
                  <div
                    className="teacher-students-progress-bar__fill"
                    style={{
                      width: `${Math.min(student.progression_moyenne, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="teacher-students-card__activity">
                <span>Dernière activité</span>
                <p>{student.derniere_activite}</p>
              </div>

              <div className="teacher-students-card__actions">
                <button
                  className="teacher-students-follow-btn"
                  onClick={() => navigate(`/teacher/students/${student.id}`)}
                  type="button"
                >
                  <span>Voir le suivi</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="teacher-students-empty-box">
            <Users size={22} />
            <p>Aucun étudiant trouvé.</p>
          </div>
        )}
      </div>
    </section>
  );
}