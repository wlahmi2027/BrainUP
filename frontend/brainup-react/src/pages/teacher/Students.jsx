<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Students() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });

  const navigate = useNavigate();

  // Fetch students
  useEffect(() => {
    async function fetchStudents() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:8001/api/courses/all-etudiants/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Erreur lors du chargement");

        const data = await res.json();
        setStudents(data.students);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchStudents();
  }, [navigate]);

  // Handle sorting
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "desc" ? "asc" : "desc",
        };
      }
      return { key, direction: "desc" };
    });
  }

  // Filter + Sort
  const filteredStudents = useMemo(() => {
    let result = students;

    // Filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(q) ||
          student.email.toLowerCase().includes(q) ||
          student.course.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [students, query, sortConfig]);

  function renderArrow(key) {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "desc" ? " ↓" : " ↑";
=======
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
} from "lucide-react";

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
    if (status === "Excellent") return "teacher-pill teacher-pill--success";
    if (status === "À relancer") return "teacher-pill teacher-pill--warn";
    return "teacher-pill teacher-pill--neutral";
  };

  if (loading) {
    return (
      <section className="page teacher-page">
        <div className="teacher-head">
          <div>
            <h1 className="page__title">Étudiants</h1>
            <p className="teacher-subtitle">Chargement des étudiants...</p>
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
            <h1 className="page__title">Étudiants</h1>
            <p className="teacher-subtitle" style={{ color: "red" }}>
              {error}
            </p>
          </div>
        </div>
      </section>
    );
>>>>>>> origin/wissam
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Étudiants</h1>
          <p className="teacher-subtitle">
            Suivez vos apprenants et accédez à leur progression en détail.
          </p>
        </div>
      </div>

<<<<<<< HEAD
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="teacher-toolbar">
        <div className="searchInline">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un cours ou un étudiant"
          />
        </div>
      </div>

      <div className="teacher-students-table">
        <div className="teacher-students-table__head">
          <span
            onClick={() => handleSort("name")}
            style={{ cursor: "pointer" }}
          >
            Étudiant{renderArrow("name")}
          </span>

          <span
            onClick={() => handleSort("course")}
            style={{ cursor: "pointer" }}
          >
            Cours{renderArrow("course")}
          </span>

          <span
            onClick={() => handleSort("progress")}
            style={{ cursor: "pointer" }}
          >
            Progression{renderArrow("progress")}
          </span>

          <span>Statut</span>
          <span>Actions</span>
        </div>

        {filteredStudents.map((student, index) => (
          <div key={index} className="teacher-students-table__row">
            <div className="teacher-student-user">
              <div className="teacher-student-avatar">
                {student.name.charAt(0)}
=======
      <div className="teacher-stats">
        <article className="teacher-stat-card">
          <div className="teacher-stat-card__icon">
            <Users size={22} />
          </div>
          <div>
            <div className="teacher-stat-card__value">{summary.total_students}</div>
            <div className="teacher-stat-card__label">Étudiants au total</div>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-card__icon">
            <UserCheck size={22} />
          </div>
          <div>
            <div className="teacher-stat-card__value">{summary.active_students}</div>
            <div className="teacher-stat-card__label">Actifs</div>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-card__icon">
            <Award size={22} />
          </div>
          <div>
            <div className="teacher-stat-card__value">{summary.excellent_students}</div>
            <div className="teacher-stat-card__label">Excellents</div>
          </div>
        </article>

        <article className="teacher-stat-card">
          <div className="teacher-stat-card__icon">
            <TriangleAlert size={22} />
          </div>
          <div>
            <div className="teacher-stat-card__value">{summary.to_follow_students}</div>
            <div className="teacher-stat-card__label">À relancer</div>
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
            <article key={student.id} className="teacher-student-card">
              <div className="teacher-student-card__top">
                <div className="teacher-student-card__identity">
                  <div className="teacher-student-card__avatar">
                    {student.initial}
                  </div>

                  <div>
                    <h3 className="teacher-student-card__name">{student.nom}</h3>
                    <p className="teacher-student-card__email">{student.email}</p>
                  </div>
                </div>

                <span className={getStatusClass(student.statut)}>
                  {student.statut}
                </span>
>>>>>>> origin/wissam
              </div>

              <div className="teacher-student-card__metrics">
                <div className="teacher-student-card__metric">
                  <span>Cours suivis</span>
                  <strong>{student.courses.length}</strong>
                </div>

                <div className="teacher-student-card__metric">
                  <span>Moyenne quiz</span>
                  <strong>{student.moyenne_quiz}%</strong>
                </div>
              </div>

<<<<<<< HEAD
            <div className="teacher-student-course">
              {student.course}
            </div>
=======
              <div className="teacher-student-card__progress">
                <div className="teacher-student-card__progress-top">
                  <span>Progression moyenne</span>
                  <strong>{student.progression_moyenne}%</strong>
                </div>
>>>>>>> origin/wissam

                <div className="teacher-progress-bar teacher-progress-bar--large">
                  <div
                    className="teacher-progress-bar__fill"
                    style={{ width: `${Math.min(student.progression_moyenne, 100)}%` }}
                  />
                </div>
              </div>

              <div className="teacher-student-card__activity">
                <span>Dernière activité</span>
                <p>{student.derniere_activite}</p>
              </div>

              <div className="teacher-student-card__actions">
                <button
                  className="btn btn--primary"
                  onClick={() => navigate(`/teacher/students/${student.id}`)}
                >
                  Voir le suivi
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="teacher-empty-box">
            <p>Aucun étudiant trouvé.</p>
          </div>
        )}
      </div>
    </section>
  );
}