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

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8001/api/courses/?mine=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Erreur lors du chargement des cours.");
        }

        const data = await res.json();

        const normalized = data.map((c) => ({
          id: c.id,
          title: c.title,
          author: c.author || "—",
          banner: c.banniere || null,
          status: c.status || "brouillon",
          students: c.students ?? 0,
          lessons: c.lessons ?? 0,
        }));

        setCourses(normalized);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement.");
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

  const getStatusLabel = (status) => {
    return {
      publie: "Publié",
      brouillon: "Brouillon",
      archive: "Archivé",
    }[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === "publie") return "teacher-badge--success";
    if (status === "brouillon") return "teacher-badge--warn";
    return "teacher-badge--muted";
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="courses-page">
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

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <p>Aucun cours trouvé.</p>
        ) : (
          filteredCourses.map((c) => (
            <div key={c.id} className="course-card">
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

                <span
                  className={`teacher-badge ${getStatusClass(c.status)}`}
                  style={{ position: "absolute", top: 8, right: 8 }}
                >
                  {getStatusLabel(c.status)}
                </span>
              </div>

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
                    onClick={() => navigate(`/teacher/courses/${c.id}`)}
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
                      Publication
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