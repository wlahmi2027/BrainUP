import { useEffect, useState, useMemo } from "react";
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

        // normalize to match student structure
        const normalized = data.map((c) => ({
          id: c.id,
          title: c.title,
          author: c.enseignant?.nom || "—",
          banner: c.banniere,
          status: c.status,
          students: c.students ?? 0,
          lessons: c.lessons ?? 0,
        }));

        setCourses(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery =
        !query.trim() ||
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.author.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        course.status?.toLowerCase() === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [courses, query, statusFilter]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="courses-page">
      {/* HEADER */}
      <div className="courses-header">
        <h1>Gestion des Cours</h1>

        <div className="courses-toolbar">
          <input
            placeholder="Rechercher un cours..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            className="btn btn--primary"
            onClick={() => navigate("/teacher/courses/create")}
          >
            + Créer un cours
          </button>
        </div>
      </div>

      {/* STATUS FILTER */}
      <div className="courses-tabs">
        {["all", "publié", "brouillon", "archivé"].map((s) => (
          <button
            key={s}
            className={statusFilter === s ? "active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {{
              all: "Tous",
              publié: "Publiés",
              brouillon: "Brouillons",
              archivé: "Archivés",
            }[s]}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <p>Aucun cours trouvé.</p>
        ) : (
          filteredCourses.map((c) => (
            <div key={c.id} className="course-card">
              {/* BANNER */}
              <div
                className="course-banner"
                style={
                  c.banner
                    ? {
                      backgroundImage: `url(${c.banner})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                    : undefined
                }
              >
                <div className="banner-overlay">
                  <h3>{c.title}</h3>
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`teacher-badge ${c.status === "Publié"
                    ? "teacher-badge--success"
                    : c.status === "Brouillon"
                      ? "teacher-badge--warn"
                      : "teacher-badge--muted"
                    }`}
                  style={{ position: "absolute", top: 8, right: 8 }}
                >
                  {c.status}
                </span>
              </div>

              {/* CONTENT */}
              <div className="course-content">
                <p className="course-author">{c.author}</p>

                <div className="course-stats">
                  <span>{c.students} étudiants</span>
                  <span>{c.lessons} leçons</span>
                </div>

                <div className="teacher-course-card__actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/teacher/courses/${c.id}/edit`)}
                  >
                    Modifier
                  </button>

                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/teacher/courses/${c.id}`)} // view page
                  >
                    Voir
                  </button>
                  <div>
                    <button
                      className="btn btn--soft"
                      onClick={() => navigate(`/teacher/courses/${c.id}/students`)}
                    >
                      Étudiants
                    </button>

                    <button className="btn btn--ghost">
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}