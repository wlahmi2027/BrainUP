import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Courses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FILTERS = ["all", "publie", "brouillon", "archive"];
  async function updateStatus(courseId, newStatus) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmMsg = `Passer ce cours en "${newStatus}" ?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `http://localhost:8001/api/courses/${courseId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la mise à jour.");

      // update local state
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, status: newStatus } : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  }
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
          students: c.etudiants_count ?? 0,
          lessons: c.lecons_count ?? 0,
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
        {FILTERS.map((s) => (
          <button
            key={s}
            className={statusFilter === s ? "active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {{
              all: "Tous",
              publie: "Publiés",
              brouillon: "Brouillons",
              archive: "Archivés",
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
                  <span className="stat-badge">
                    👥 {c.students} étudiants
                  </span>
                  <span className="stat-badge">
                    📚 {c.lessons} leçons
                  </span>
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
                    onClick={() => navigate(`/teacher/courses/${c.id}`)}
                  >
                    Voir
                  </button>
                  <div>
                    <button
                      className="btn btn--soft"
                      onClick={() => navigate(`/teacher/courses/${c.id}`)}
                    >
                      Étudiants
                    </button>

                    <select
                      className="btn btn--ghost"
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                    >
                      <option value="publie">Publier</option>
                      <option value="brouillon">Brouillon</option>
                      <option value="archive">Archiver</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section >
  );
}