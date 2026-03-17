import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("content"); // content | favorites
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch courses and student-specific info (favorites, progression)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    async function loadCourses() {
      try {
        const res = await fetch("http://localhost:8001/api/student/courses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des cours");
        const data = await res.json();

        // Normalize: merge course info with student-specific inscription
        const normalized = data.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          level: c.niveau,
          author: c.enseignant.nom,
          students: c.etudiants_count ?? 0,
          lessons: c.lecons_count ?? 0,
          progression: c.inscription?.progression ?? 0,
          isFavorite: c.inscription?.favoris ?? false,
          note_moyenne: c.inscription?.note_moyenne ?? 0,
        }));

        setCourses(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [navigate]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q)
      );
    }
    if (tab === "favorites") {
      result = result.filter((c) => c.isFavorite);
    }
    return result;
  }, [courses, query, tab]);

  const sortedCourses = useMemo(() => {
    const result = [...filteredCourses];
    if (sortBy === "title") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === "progression") result.sort((a, b) => b.progression - a.progression);
    return result;
  }, [filteredCourses, sortBy]);

  const toggleFavorite = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Optimistic UI update
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c))
    );

    // Send to backend
    try {
      await fetch(`http://localhost:8001/api/student/courses/${courseId}/favorite/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("Erreur mise à jour favoris", err);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="page">
      <div className="page__header">
        <h1 className="page__title">Catalogue des cours</h1>
        <div className="filters">
          <button className={tab === "content" ? "is-active" : ""} onClick={() => setTab("content")}>
            🎯 Tous les cours
          </button>
          <button className={tab === "favorites" ? "is-active" : ""} onClick={() => setTab("favorites")}>
            ⭐ Mes favoris
          </button>
        </div>
        <div className="searchInline">
          <input
            placeholder="Rechercher un cours ou un enseignant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {sortedCourses.length === 0 ? (
        <p>Aucun cours trouvé.</p>
      ) : (
        <div className={viewMode === "grid" ? "coursesgrid" : "listWrap"}>
          {sortedCourses.map((c) => (
            <article key={c.id} className="course card">
              <div className="course__body">
                <h3>{c.title}</h3>
                <p>{c.author} • {c.level}</p>
                <p>Progression : {c.progression}%</p>
                <p className="course__desc">
                  {c.description.split(" ").slice(0, 50).join(" ")}
                  {c.description.split(" ").length > 50 ? "…" : ""}
                </p>

                <div className="course__actions">
                  <button className="btn btn--primary" onClick={() => navigate(`/student/courses/${c.id}`)}>
                    Ouvrir
                  </button>
                  <button
                    className={`btn btn--ghost ${c.isFavorite ? "is-fav" : ""}`}
                    onClick={() => toggleFavorite(c.id)}
                  >
                    {c.isFavorite ? "★ Favori" : "☆ Ajouter"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}