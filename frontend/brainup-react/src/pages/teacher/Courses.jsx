import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");



  const courses = useMemo(
    () => [
      {
        id: 1,
        title: "Python avancé",
        category: "Programmation",
        students: 34,
        lessons: 12,
        status: "Publié",
      },
      {
        id: 2,
        title: "React moderne",
        category: "Frontend",
        students: 41,
        lessons: 9,
        status: "Publié",
      },
      {
        id: 3,
        title: "Bases de données",
        category: "Backend",
        students: 22,
        lessons: 7,
        status: "Brouillon",
      },
      {
        id: 4,
        title: "Machine Learning",
        category: "IA",
        students: 17,
        lessons: 15,
        status: "Archivé",
      },
    ],
    []
  );

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.category.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (course) => course.status.toLowerCase() === statusFilter
      );
    }

    return result;
  }, [courses, query, statusFilter]);

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Gestion des cours</h1>
          <p className="teacher-subtitle">
            Créez, modifiez et publiez vos cours.
          </p>
        </div>

        <button className="btn btn--primary" onClick={() => navigate("/teacher/courses/create")}>+ Créer un cours</button>
      </div>

      <div className="teacher-toolbar">
        <div className="searchInline">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un cours..."
          />
        </div>

        <div className="seg">
          <button
            className={`seg__btn ${statusFilter === "all" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Tous
          </button>
          <button
            className={`seg__btn ${
              statusFilter === "publié" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("publié")}
          >
            Publiés
          </button>
          <button
            className={`seg__btn ${
              statusFilter === "brouillon" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("brouillon")}
          >
            Brouillons
          </button>
          <button
            className={`seg__btn ${
              statusFilter === "archivé" ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter("archivé")}
          >
            Archivés
          </button>
        </div>
      </div>

      <div className="teacher-courses-grid">
        {filteredCourses.map((course) => (
          <article key={course.id} className="teacher-course-card">
            <div className="teacher-course-card__header">
              <div className="teacher-course-card__icon">📘</div>
              <span
                className={`teacher-badge ${
                  course.status === "Publié"
                    ? "teacher-badge--success"
                    : course.status === "Brouillon"
                    ? "teacher-badge--warn"
                    : "teacher-badge--muted"
                }`}
              >
                {course.status}
              </span>
            </div>

            <h3 className="teacher-course-card__title">{course.title}</h3>
            <p className="teacher-course-card__meta">{course.category}</p>

            <div className="teacher-course-card__stats">
              <span>{course.students} étudiants</span>
              <span>{course.lessons} leçons</span>
            </div>

            <div className="teacher-course-card__actions">
              <button className="btn btn--ghost">Modifier</button>
              <button className="btn btn--soft">Étudiants</button>
              <button className="btn btn--primary">Publier</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}