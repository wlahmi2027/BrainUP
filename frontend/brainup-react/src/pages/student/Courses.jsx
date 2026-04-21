import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Star,
  ChartColumn,
  ArrowRight,
  UserRound,
  GraduationCap,
} from "lucide-react";
import "../../styles/student/courses.css";

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
        author: c.enseignant?.nom || "",
        progression: c.inscription?.progression_percent ?? 0,
        isFavorite: c.inscription?.favoris ?? false,
        banner: c.banniere,
        inscription: c.inscription,
      }));

      setCourses(normalized);
    } catch (err) {
      console.error("loadCourses error =", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(courseId) {
    const token = localStorage.getItem("token");

    if (!window.confirm("Voulez-vous vraiment vous inscrire à ce cours ?")) {
      return;
    }

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

      await loadCourses();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUnsubscribe(courseId) {
    const token = localStorage.getItem("token");

    if (
      !window.confirm("Voulez-vous vraiment vous désinscrire de ce cours ?")
    ) {
      return;
    }

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

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q)
      );
    }

    if (tab === "favorites") {
      result = result.filter((c) => c.isFavorite);
    }

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progression") {
      result.sort((a, b) => b.progression - a.progression);
    } else {
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
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );

    try {
      await fetch(`http://localhost:8001/api/student/courses/${id}/favorite/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <section className="student-courses-page">
        <div className="student-courses-loading">Chargement des cours...</div>
      </section>
    );
  }

  return (
    <section className="student-courses-page">
      <div className="student-courses-hero">
        <div>
          <div className="student-courses-eyebrow">
            <GraduationCap size={14} />
            <span>Catalogue pédagogique</span>
          </div>

          <h1 className="student-courses-title">Catalogue des cours</h1>
          <p className="student-courses-subtitle">
            Explorez les contenus disponibles, reprenez votre progression et
            retrouvez rapidement vos cours favoris.
          </p>
        </div>

        <div className="student-courses-summary">
          <div className="student-courses-summary__item">
            <span>Cours disponibles</span>
            <strong>{courses.length}</strong>
          </div>
          <div className="student-courses-summary__item">
            <span>Favoris</span>
            <strong>{courses.filter((c) => c.isFavorite).length}</strong>
          </div>
        </div>
      </div>

      <div className="student-courses-toolbar">
        <div className="student-courses-search">
          <Search size={18} />
          <input
            placeholder="Rechercher un cours ou un enseignant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="student-courses-sort">
          <button
            className={sortBy === "title" ? "is-active" : ""}
            onClick={() => setSortBy("title")}
            type="button"
          >
            <BookOpen size={16} />
            <span>Alphabétique</span>
          </button>

          <button
            className={sortBy === "progression" ? "is-active" : ""}
            onClick={() => setSortBy("progression")}
            type="button"
          >
            <ChartColumn size={16} />
            <span>Progression</span>
          </button>
        </div>
      </div>

      <div className="student-courses-tabs">
        <button
          className={tab === "all" ? "is-active" : ""}
          onClick={() => setTab("all")}
          type="button"
        >
          <BookOpen size={16} />
          <span>Tous les cours</span>
        </button>

        <button
          className={tab === "favorites" ? "is-active" : ""}
          onClick={() => setTab("favorites")}
          type="button"
        >
          <Star size={16} />
          <span>Mes favoris</span>
        </button>
      </div>

      <div className="student-courses-section-title">
        <h2>{tab === "favorites" ? "Mes favoris" : "Nos cours"}</h2>
        <p>{filteredAndSorted.length} résultat(s)</p>
      </div>

      <div className="student-courses-grid">
        {filteredAndSorted.length === 0 ? (
          <div className="student-courses-empty">
            <BookOpen size={22} />
            <p>Aucun cours trouvé.</p>
          </div>
        ) : (
          filteredAndSorted.map((c) => {
            const isEnrolled = !!c.inscription;

            return (
              <article key={c.id} className="student-course-card">
                <div
                  className="student-course-card__banner"
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
                  <div className="student-course-card__overlay" />

                  <div className="student-course-card__banner-content">
                    <span className="student-course-card__chip">
                      {isEnrolled ? "Inscrit" : "Disponible"}
                    </span>
                    <h3>{c.title}</h3>
                  </div>
                </div>

                <div className="student-course-card__body">
                  <div className="student-course-card__author">
                    <UserRound size={15} />
                    <span>{c.author || "Enseignant"}</span>
                  </div>

                  <div className="student-course-card__progress-top">
                    <span>Progression</span>
                    <strong>{c.progression}%</strong>
                  </div>

                  <div className="student-course-card__progress">
                    <div
                      className="student-course-card__progress-fill"
                      style={{ width: `${c.progression}%` }}
                    />
                  </div>

                  <p className="student-course-card__progress-text">
                    {c.progression}% complété
                  </p>

                  <div className="student-course-card__actions">
                    {!isEnrolled ? (
                      <button
                        className="student-course-btn student-course-btn--primary"
                        onClick={() => handleEnroll(c.id)}
                        type="button"
                      >
                        S’inscrire
                      </button>
                    ) : (
                      <>
                        <button
                          className="student-course-btn student-course-btn--primary"
                          onClick={() => navigate(`/student/courses/${c.id}`)}
                          type="button"
                        >
                          <span>Voir le cours</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          className="student-course-btn student-course-btn--ghost"
                          onClick={() => handleUnsubscribe(c.id)}
                          type="button"
                        >
                          Désinscrire
                        </button>

                        <button
                          className={`student-course-favorite ${
                            c.isFavorite ? "is-active" : ""
                          }`}
                          onClick={() => toggleFavorite(c.id)}
                          type="button"
                          aria-label="Ajouter aux favoris"
                          title="Ajouter aux favoris"
                        >
                          <Star size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}