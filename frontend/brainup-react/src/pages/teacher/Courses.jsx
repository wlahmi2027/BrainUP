import { useState, useEffect, useMemo } from "react";
import { api } from "../../api/client"; // named import

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load courses from localStorage or fetch from API if empty
  useEffect(() => {
    api.get("/courses/")
      .then((res) => {
        console.log("Courses API response:", res.data);
        setCourses(res.data);
        localStorage.setItem("courses", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err.response || err);
      });
  }, []);

  // Filter courses by search query and optional status
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (course) => course.status?.toLowerCase() === statusFilter
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

        <button className="btn btn--primary">+ Créer un cours</button>
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
            className={`seg__btn ${statusFilter === "publié" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("publié")}
          >
            Publiés
          </button>
          <button
            className={`seg__btn ${statusFilter === "brouillon" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("brouillon")}
          >
            Brouillons
          </button>
          <button
            className={`seg__btn ${statusFilter === "archivé" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("archivé")}
          >
            Archivés
          </button>
        </div>
      </div>

      <div className="teacher-courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, i) => (
            <article key={i} className="teacher-course-card">
              <div className="teacher-course-card__header">
                <div className="teacher-course-card__icon">📘</div>
                <span className="teacher-badge teacher-badge--muted"></span>
              </div>

              <h3 className="teacher-course-card__title">{course.title}</h3>
              <p className="teacher-course-card__meta">{course.description}</p>

              <div className="teacher-course-card__stats">
                <span>{course.temps_apprentissage} min</span>
              </div>

              <div className="teacher-course-card__actions">
                <button className="btn btn--ghost">Modifier</button>
                <button className="btn btn--soft">Étudiants</button>
                <button className="btn btn--primary">Publier</button>
              </div>
            </article>
          ))
        ) : (
          <p>Aucun cours disponible.</p>
        )}
      </div>
    </section>
  );
}