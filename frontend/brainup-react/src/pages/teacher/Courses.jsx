import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8001/api/courses/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Erreur lors du chargement des cours.");

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const filteredCourses = courses.filter((course) => {
    const matchesQuery =
      !query.trim() ||
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      course.status.toLowerCase() === statusFilter;

    return matchesQuery && matchesStatus;
  });

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Gestion des cours</h1>
          <p className="teacher-subtitle">Créez, modifiez et publiez vos cours.</p>
        </div>
        <button className="btn btn--primary" onClick={() => navigate("/teacher/courses/create")}>
          + Créer un cours
        </button>
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
          {["all", "publié", "brouillon", "archivé"].map((s) => (
            <button
              key={s}
              className={`seg__btn ${statusFilter === s ? "is-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {{ all: "Tous", publié: "Publiés", brouillon: "Brouillons", archivé: "Archivés" }[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="teacher-courses-grid">
        {filteredCourses.length === 0 && (
          <p>Aucun cours trouvé.</p>
        )}
        {filteredCourses.map((course) => (
          <article key={course.id} className="teacher-course-card">
            <div className="teacher-course-card__header">
              <div className="teacher-course-card__icon">📘</div>
              <span
                className={`teacher-badge ${
                  course.status === "Publié" ? "teacher-badge--success"
                  : course.status === "Brouillon" ? "teacher-badge--warn"
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