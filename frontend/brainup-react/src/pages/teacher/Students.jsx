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
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Étudiants inscrits</h1>
          <p className="teacher-subtitle">
            Suivez vos apprenants par cours et progression.
          </p>
        </div>
      </div>

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
              </div>
              <div>
                <div className="teacher-row__title">{student.name}</div>
                <div className="teacher-row__meta">{student.email}</div>
              </div>
            </div>

            <div className="teacher-student-course">
              {student.course}
            </div>

            <div className="teacher-student-progress">
              <div className="teacher-progress-bar">
                <div
                  className="teacher-progress-bar__fill"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
              <span>{student.progress}%</span>
            </div>

            <div>
              <span
                className={`teacher-badge ${
                  student.status === "Excellent"
                    ? "teacher-badge--success"
                    : student.status === "À relancer"
                    ? "teacher-badge--warn"
                    : "teacher-badge--muted"
                }`}
              >
                {student.status}
              </span>
            </div>

            <div className="teacher-student-actions">
              <button className="btn btn--ghost">Voir profil</button>
              <button className="btn btn--soft">Résultats</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}