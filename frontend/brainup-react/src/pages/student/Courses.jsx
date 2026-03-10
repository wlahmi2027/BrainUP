import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "../api/courses";

// Fallback local si backend down
const MOCK = [
  {
    id: 1,
    title: "Introduction à Python",
    author: "Léa Théode",
    subtitle: "Cours & exercices",
    rating: 0,
    votes: 0,
    isFavorite: false,
    level: "Débutant",
    description: "Apprenez les bases de Python pas à pas.",
  },
  {
    id: 2,
    title: "Machine Learning Avancé",
    author: "Léo Martin",
    subtitle: "Cours & exercices",
    rating: 0,
    votes: 0,
    isFavorite: false,
    level: "Avancé",
    description: "Approfondissez vos compétences en machine learning.",
  },
  {
    id: 3,
    title: "Design Web Moderne",
    author: "Inès M.",
    subtitle: "Cours & exercices",
    rating: 0,
    votes: 0,
    isFavorite: false,
    level: "Intermédiaire",
    description: "Découvrez les bases du design web moderne.",
  },
];

function Stars({ value = 0, onRate }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value;

  return (
    <div className="stars" aria-label="Note du cours">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${shown >= n ? "is-on" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onRate?.(n)}
          title={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function normalizeCourses(data) {
  const raw = Array.isArray(data) ? data : data?.results || [];

  return raw.map((c, idx) => ({
    id: c.id ?? idx + 1,
    title: c.title ?? c.name ?? "Sans titre",
    author: c.author ?? c.teacher ?? "Inconnu",
    subtitle: c.subtitle ?? "Cours & exercices",
    rating: Number(c.rating ?? 0),
    votes: Number(c.votes ?? 0),
    isFavorite: Boolean(c.isFavorite ?? c.is_favorite ?? false),
    level: c.level ?? "—",
    description: c.description ?? "",
  }));
}

export default function Cours() {
  const navigate = useNavigate();

  // UI state
  const [tab, setTab] = useState("contenu"); // contenu | filter | progress | liked
  const [sortBy, setSortBy] = useState("choix"); // choix | rating | title
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [query, setQuery] = useState("");

  // Data state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setApiDown(false);

        const data = await fetchCourses();
        if (!alive) return;

        const normalized = normalizeCourses(data);
        setCourses(normalized.length ? normalized : MOCK);
      } catch (error) {
        if (!alive) return;
        console.error("Erreur chargement cours:", error);
        setApiDown(true);
        setCourses(MOCK);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let arr = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (tab === "liked") {
      arr = arr.filter((c) => c.isFavorite);
    }

    if (tab === "progress") {
      // Tant qu'on n'a pas de vraie progression par cours, on garde tout
      arr = [...arr];
    }

    if (tab === "filter") {
      // Placeholder pour futur vrai filtrage
      arr = [...arr];
    }

    return arr;
  }, [courses, query, tab]);

  const sorted = useMemo(() => {
    const arr = [...filtered];

    if (sortBy === "rating") {
      arr.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
    } else if (sortBy === "title") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // "choix" = tri simple par titre + votes si présents
      arr.sort((a, b) => (b.votes + b.rating * 10) - (a.votes + a.rating * 10));
    }

    return arr;
  }, [filtered, sortBy]);

  const handleRate = (courseId, rating) => {
    console.warn("Notation non encore connectée au backend", { courseId, rating });
  };

  const handleFavorite = (courseId) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
    console.warn("Favoris non encore connectés au backend", { courseId });
  };

  const active = (k) => (tab === k ? "is-active" : "");
  const activeSort = (k) => (sortBy === k ? "is-active" : "");
  const activeView = (k) => (viewMode === k ? "is-active" : "");

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Catalogue des Cours</h1>

          <div className="filters">
            <button
              className={`chip ${active("contenu")}`}
              onClick={() => setTab("contenu")}
            >
              🎯 Contenu
            </button>

            <button
              className={`chip ${active("filter")}`}
              onClick={() => setTab("filter")}
            >
              📚 Filtrer
            </button>

            <button
              className={`chip ${active("progress")}`}
              onClick={() => setTab("progress")}
            >
              📈 Mes Progressions
            </button>

            <button
              className={`chip ${active("liked")}`}
              onClick={() => setTab("liked")}
            >
              ⭐ Mes plus aimés
            </button>
          </div>
        </div>

        <div className="page__right">
          <div className="selectRow">
            <div className="seg">
              <button
                className={`seg__btn ${activeSort("choix")}`}
                onClick={() => setSortBy("choix")}
              >
                choix volonté →
              </button>

              <button
                className={`seg__btn ${activeSort("rating")}`}
                onClick={() => setSortBy("rating")}
              >
                Top notes
              </button>

              <button
                className={`seg__btn ${activeSort("title")}`}
                onClick={() => setSortBy("title")}
              >
                A-Z
              </button>
            </div>

            <div className="seg">
              <button
                className={`seg__btn ${activeView("grid")}`}
                onClick={() => setViewMode("grid")}
              >
                Ress lister
              </button>

              <button
                className={`seg__btn ${activeView("list")}`}
                onClick={() => setViewMode("list")}
              >
                Liste
              </button>
            </div>
          </div>

          <div className="searchInline">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un cours / prof..."
            />
          </div>
        </div>
      </div>

      <div className="sectionhead">
        <div className="sectionhead__title">Nos Cours</div>

        <div className="sectionhead__meta">
          {apiDown ? (
            <span className="badgeWarn">Backend off → mode local</span>
          ) : (
            <span className="badgeOk">API OK</span>
          )}
          <span className="muted">{sorted.length} résultat(s)</span>
        </div>
      </div>

      {loading ? (
        <div className="card card--pad">Chargement…</div>
      ) : sorted.length === 0 ? (
        <div className="card card--pad">Aucun cours trouvé.</div>
      ) : viewMode === "grid" ? (
        <div className="coursesgrid">
          {sorted.map((c) => (
            <article key={c.id} className="course">
              <div className="course__img">
                <div className="course__imgPlaceholder" />
              </div>

              <div className="course__body">
                <h3 className="course__title">{c.title}</h3>

                <div className="course__meta">
                  <div className="avatarmini">👤</div>

                  <div className="course__author">
                    <div className="course__name">{c.author}</div>
                    <div className="course__sub">
                      {c.subtitle} • {c.level}
                    </div>
                  </div>

                  <div className="course__rating">
                    <Stars value={c.rating} onRate={(r) => handleRate(c.id, r)} />
                    <span className="votes">({c.votes})</span>
                  </div>
                </div>

                <p className="course__desc">{c.description}</p>

                <div className="course__actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/cours/${c.id}`)}
                  >
                    Voir Cours
                  </button>

                  <button
                    className={`btn btn--ghost ${c.isFavorite ? "is-fav" : ""}`}
                    onClick={() => handleFavorite(c.id)}
                  >
                    {c.isFavorite ? "★ Aimé" : "☆ Mes notes"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="listWrap">
          {sorted.map((c) => (
            <div key={c.id} className="listRow card card--pad">
              <div className="listMain">
                <div className="listTitle">{c.title}</div>
                <div className="listSub">
                  {c.author} • {c.level}
                </div>
                <div className="listDesc">{c.description}</div>
              </div>

              <div className="listRight">
                <Stars value={c.rating} onRate={(r) => handleRate(c.id, r)} />
                <span className="votes">({c.votes})</span>

                <button
                  className="btn btn--primary"
                  onClick={() => navigate(`/cours/${c.id}`)}
                >
                  Ouvrir
                </button>

                <button
                  className={`btn btn--ghost ${c.isFavorite ? "is-fav" : ""}`}
                  onClick={() => handleFavorite(c.id)}
                >
                  {c.isFavorite ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}