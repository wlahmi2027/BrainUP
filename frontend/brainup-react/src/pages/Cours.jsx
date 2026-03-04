import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourses, rateCourse, toggleFavorite } from "../api/courses";

// fallback si backend down
const MOCK = [
  {
    id: 1,
    title: "Introduction à Python",
    author: "Léa Théode",
    subtitle: "Cours & exercices",
    rating: 4.5,
    votes: 128,
    isFavorite: false,
    level: "Débutant",
  },
  {
    id: 2,
    title: "Machine Learning Avancé",
    author: "Léo Martin",
    subtitle: "Cours & exercices",
    rating: 5,
    votes: 88,
    isFavorite: true,
    level: "Avancé",
  },
  {
    id: 3,
    title: "Design Web Moderne",
    author: "Inès M.",
    subtitle: "Cours & exercices",
    rating: 4,
    votes: 64,
    isFavorite: false,
    level: "Intermédiaire",
  },
];

function Stars({ value, onRate }) {
  const [hover, setHover] = useState(null);
  const shown = hover ?? value;

  return (
    <div className="stars" aria-label="Note">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${shown >= n ? "is-on" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onRate(n)}
          title={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Cours() {
  const navigate = useNavigate();

  // UI state
  const [tab, setTab] = useState("contenu"); // contenu | filter | progress | liked
  const [sortBy, setSortBy] = useState("choix"); // choix | rating | title
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [query, setQuery] = useState("");

  // data state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);

  // 1) Charger les cours
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setApiDown(false);
        const data = await fetchCourses();
        if (!alive) return;

        // on normalise un peu (au cas où backend renvoie d'autres noms)
        const normalized = (Array.isArray(data) ? data : data.results || []).map((c, idx) => ({
          id: c.id ?? idx + 1,
          title: c.title ?? c.name ?? "Sans titre",
          author: c.author ?? c.teacher ?? "Inconnu",
          subtitle: c.subtitle ?? c.description_short ?? "Cours & exercices",
          rating: Number(c.rating ?? 0),
          votes: Number(c.votes ?? 0),
          isFavorite: Boolean(c.is_favorite ?? c.isFavorite ?? false),
          level: c.level ?? "—",
        }));

        setCourses(normalized.length ? normalized : MOCK);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setApiDown(true);
        setCourses(MOCK);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // 2) Filtrer + search + onglets
  const filtered = useMemo(() => {
    let arr = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((c) => c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q));
    }

    if (tab === "liked") arr = arr.filter((c) => c.isFavorite);

    return arr;
  }, [courses, query, tab]);

  // 3) Trier
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "rating") {
      arr.sort((a, b) => (b.rating + b.votes / 1000) - (a.rating + a.votes / 1000));
    } else if (sortBy === "title") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // "choix" = mélange score rating + votes
      arr.sort((a, b) => (b.rating * 10 + b.votes) - (a.rating * 10 + a.votes));
    }
    return arr;
  }, [filtered, sortBy]);

  // 4) Actions
  const handleRate = async (courseId, rating) => {
    // UI optimistic
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, rating, votes: c.votes + 1 } : c
      )
    );

    try {
      await rateCourse(courseId, rating);
    } catch {
      // si backend down => on garde UI quand même
    }
  };

  const handleFavorite = async (courseId) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isFavorite: !c.isFavorite } : c))
    );

    try {
      await toggleFavorite(courseId);
    } catch {
      // idem
    }
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
            <button className={`chip ${active("contenu")}`} onClick={() => setTab("contenu")}>
              🎯 Contenu
            </button>
            <button className={`chip ${active("filter")}`} onClick={() => setTab("filter")}>
              📚 Filtrer
            </button>
            <button className={`chip ${active("progress")}`} onClick={() => setTab("progress")}>
              📈 Mes Progressions
            </button>
            <button className={`chip ${active("liked")}`} onClick={() => setTab("liked")}>
              ⭐ Mes plus aimés
            </button>
          </div>
        </div>

        <div className="page__right">
          <div className="selectRow">
            <div className="seg">
              <button className={`seg__btn ${activeSort("choix")}`} onClick={() => setSortBy("choix")}>
                choix volonté →
              </button>
              <button className={`seg__btn ${activeSort("rating")}`} onClick={() => setSortBy("rating")}>
                Top notes
              </button>
              <button className={`seg__btn ${activeSort("title")}`} onClick={() => setSortBy("title")}>
                A-Z
              </button>
            </div>

            <div className="seg">
              <button className={`seg__btn ${activeView("grid")}`} onClick={() => setViewMode("grid")}>
                Ress lister
              </button>
              <button className={`seg__btn ${activeView("list")}`} onClick={() => setViewMode("list")}>
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
          {apiDown ? <span className="badgeWarn">Backend off → mode local</span> : <span className="badgeOk">API OK</span>}
          <span className="muted">{sorted.length} résultat(s)</span>
        </div>
      </div>

      {loading ? (
        <div className="card card--pad">Chargement…</div>
      ) : viewMode === "grid" ? (
        <div className="coursesgrid">
          {sorted.map((c) => (
            <article key={c.id} className="course">
              <div className="course__img">
                {/* image optionnelle: tu peux mettre une vraie image plus tard */}
                <div className="course__imgPlaceholder" />
              </div>

              <div className="course__body">
                <h3 className="course__title">{c.title}</h3>

                <div className="course__meta">
                  <div className="avatarmini">👤</div>
                  <div className="course__author">
                    <div className="course__name">{c.author}</div>
                    <div className="course__sub">{c.subtitle} • {c.level}</div>
                  </div>

                  <div className="course__rating">
                    <Stars value={c.rating} onRate={(r) => handleRate(c.id, r)} />
                    <span className="votes">({c.votes})</span>
                  </div>
                </div>

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
                <div className="listSub">{c.author} • {c.level}</div>
              </div>
              <div className="listRight">
                <Stars value={c.rating} onRate={(r) => handleRate(c.id, r)} />
                <span className="votes">({c.votes})</span>
                <button className="btn btn--primary" onClick={() => navigate(`/cours/${c.id}`)}>Ouvrir</button>
                <button className={`btn btn--ghost ${c.isFavorite ? "is-fav" : ""}`} onClick={() => handleFavorite(c.id)}>
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