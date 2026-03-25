import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // all | favorites
  const [sortBy, setSortBy] = useState("title");

  async function loadCourses() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8001/api/student/courses/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const normalized = data.map((c) => ({
        id: c.id,
        title: c.title,
        author: c.enseignant.nom,
        progression: c.inscription?.progression ?? 0,
        isFavorite: c.inscription?.favoris ?? false,
        banner: c.banniere,
        inscription: c.inscription,
      }));

      setCourses(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(courseId) {
    const token = localStorage.getItem("token");

    if (!window.confirm("Voulez-vous vraiment vous inscrire à ce cours ?")) return;

    try {
      const res = await fetch(
        `http://localhost:8001/api/student/courses/${courseId}/inscrire/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      // reload data
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? { ...c, inscription: { progression: 0, favoris: false } }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  }
  async function handleUnsubscribe(courseId) {
    const token = localStorage.getItem("token");

    if (!window.confirm("Voulez-vous vraiment vous désinscrire de ce cours ?")) return;

    try {
      const res = await fetch(
        `http://localhost:8001/api/student/courses/${courseId}/desinscrire/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      // refresh courses
      await loadCourses();
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadCourses();
  }, [navigate]);

  const filteredAndSorted = useMemo(() => {

    let result = [...courses];

    // SEARCH
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q)
      );
    }

    // TAB FILTER
    if (tab === "favorites") {
      result = result.filter((c) => c.isFavorite);
    }

    // SORTING
    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progression") {
      result.sort((a, b) => b.progression - a.progression);
    } else {
      // DEFAULT: favorites first, then progression
      result.sort((a, b) => {
        if (b.isFavorite !== a.isFavorite) {
          return b.isFavorite - a.isFavorite;
        }
        return b.progression - a.progression;
      });
    }

    return result;
  }, [courses, query, tab, sortBy]);

  const toggleFavorite = async (id) => {
    const token = localStorage.getItem("token");

    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );

    try {
      await fetch(
        `http://localhost:8001/api/student/courses/${id}/favorite/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };
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

  if (loading) return <p>Chargement...</p>;

  return (
    <section className="courses-page">
      {/* HEADER */}
      <div className="courses-header">
        <h1>Catalogue des Cours</h1>

        <div className="courses-toolbar">
          <input
            placeholder="Rechercher un cours..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="sort-group">
            <button
              className={sortBy === "title" ? "active" : ""}
              onClick={() => setSortBy("title")}
            >
              🔠 Alphabetique
            </button>
            <button
              className={sortBy === "progression" ? "active" : ""}
              onClick={() => setSortBy("progression")}
            >
              📊 Progression
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="courses-tabs">
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          📘 Tous les cours
        </button>
        <button
          className={tab === "favorites" ? "active" : ""}
          onClick={() => setTab("favorites")}
        >
          ⭐ Mes favoris
        </button>
      </div>

      {/* SECTION TITLE */}
      <div className="courses-section">
        <h2>{tab === "favorites" ? "Mes Favoris" : "Nos Cours"}</h2>
      </div>

      {/* GRID */}
      <div className="courses-grid">
        {filteredAndSorted.length === 0 ? (
          <p>Aucun cours trouvé.</p>
        ) : (
          filteredAndSorted.map((c) => {
            const isEnrolled = !!c.inscription;
            return (

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
                </div>

                {/* CONTENT */}
                <div className="course-content">
                  <p className="course-author">{c.author}</p>

                  <div className="course-progress">
                    <div
                      className="bar"
                      style={{ width: `${c.progression}%` }}
                    />
                  </div>

                  <p>{c.progression}% complété</p>

                  <div className="course-actions">
                    {!isEnrolled ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleEnroll(c.id)}
                      >
                        S’inscrire
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-primary"
                          onClick={() => navigate(`/student/courses/${c.id}`)}
                        >
                          Voir Cours
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleUnsubscribe(c.id)}
                        >
                          Désinscrire
                        </button>
                        <button
                          className={`favorite-btn ${c.isFavorite ? "active" : ""}`}
                          onClick={() => toggleFavorite(c.id)}
                        >
                          ★
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </section >
  );
}