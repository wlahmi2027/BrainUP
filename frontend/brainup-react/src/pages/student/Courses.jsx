import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourses } from "../../api/courses";

const FALLBACK_COURSES = [
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
  const displayedValue = hover ?? value;

  return (
    <div className="stars" aria-label="Note du cours">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${displayedValue >= star ? "is-on" : ""}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onRate?.(star)}
          title={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function normalizeCourses(data) {
  const rawCourses = Array.isArray(data) ? data : data?.results || [];

  return rawCourses.map((course, index) => ({
    id: course.id ?? index + 1,
    title: course.title ?? course.name ?? "Sans titre",
    author: course.author ?? course.teacher ?? "Inconnu",
    subtitle: course.subtitle ?? "Cours & exercices",
    rating: Number(course.rating ?? 0),
    votes: Number(course.votes ?? 0),
    isFavorite: Boolean(course.isFavorite ?? course.is_favorite ?? false),
    level: course.level ?? "—",
    description: course.description ?? "",
  }));
}

export default function Courses() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("content");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [query, setQuery] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false);

useEffect(() => {
  async function loadCourses() {
    const data = await fetchCourses();
    setCourses(data);
  }

  loadCourses();
}, []);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (query.trim()) {
      const normalizedQuery = query.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(normalizedQuery) ||
          course.author.toLowerCase().includes(normalizedQuery) ||
          course.description.toLowerCase().includes(normalizedQuery)
      );
    }

    if (tab === "favorites") {
      result = result.filter((course) => course.isFavorite);
    }

    return result;
  }, [courses, query, tab]);

  const sortedCourses = useMemo(() => {
    const result = [...filteredCourses];

    if (sortBy === "rating") {
      result.sort(
        (a, b) => b.rating - a.rating || b.votes - a.votes
      );
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort(
        (a, b) => b.votes + b.rating * 10 - (a.votes + a.rating * 10)
      );
    }

    return result;
  }, [filteredCourses, sortBy]);

  function handleRate(courseId, rating) {
    console.warn("Notation non encore connectée au backend", {
      courseId,
      rating,
    });
  }

  function handleFavorite(courseId) {
    setCourses((previousCourses) =>
      previousCourses.map((course) =>
        course.id === courseId
          ? { ...course, isFavorite: !course.isFavorite }
          : course
      )
    );

    console.warn("Favoris non encore connectés au backend", { courseId });
  }

  const isActiveTab = (key) => (tab === key ? "is-active" : "");
  const isActiveSort = (key) => (sortBy === key ? "is-active" : "");
  const isActiveView = (key) => (viewMode === key ? "is-active" : "");

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Catalogue des cours</h1>

          <div className="filters">
            <button
              className={`chip ${isActiveTab("content")}`}
              onClick={() => setTab("content")}
            >
              🎯 Tous les cours
            </button>

            <button
              className={`chip ${isActiveTab("filters")}`}
              onClick={() => setTab("filters")}
            >
              📚 Filtrer
            </button>

            <button
              className={`chip ${isActiveTab("progress")}`}
              onClick={() => setTab("progress")}
            >
              📈 Mes progressions
            </button>

            <button
              className={`chip ${isActiveTab("favorites")}`}
              onClick={() => setTab("favorites")}
            >
              ⭐ Mes favoris
            </button>
          </div>
        </div>

        <div className="page__right">
          <div className="selectRow">
            <div className="seg">
              <button
                className={`seg__btn ${isActiveSort("default")}`}
                onClick={() => setSortBy("default")}
              >
                Recommandés
              </button>

              <button
                className={`seg__btn ${isActiveSort("rating")}`}
                onClick={() => setSortBy("rating")}
              >
                Top notes
              </button>

              <button
                className={`seg__btn ${isActiveSort("title")}`}
                onClick={() => setSortBy("title")}
              >
                A-Z
              </button>
            </div>

            <div className="seg">
              <button
                className={`seg__btn ${isActiveView("grid")}`}
                onClick={() => setViewMode("grid")}
              >
                Grille
              </button>

              <button
                className={`seg__btn ${isActiveView("list")}`}
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
              placeholder="Rechercher un cours ou un enseignant..."
            />
          </div>
        </div>
      </div>

      <div className="sectionhead">
        <div className="sectionhead__title">Nos cours</div>

        <div className="sectionhead__meta">
          {apiDown ? (
            <span className="badgeWarn">Backend indisponible · mode local</span>
          ) : (
            <span className="badgeOk">API disponible</span>
          )}
          <span className="muted">{sortedCourses.length} résultat(s)</span>
        </div>
      </div>

      {loading ? (
        <div className="card card--pad">Chargement des cours...</div>
      ) : sortedCourses.length === 0 ? (
        <div className="card card--pad">Aucun cours trouvé.</div>
      ) : viewMode === "grid" ? (
        <div className="coursesgrid">
          {sortedCourses.map((course) => (
            <article key={course.id} className="course">
              <div className="course__img">
                <div className="course__imgPlaceholder" />
              </div>

              <div className="course__body">
                <h3 className="course__title">{course.title}</h3>

                <div className="course__meta">
                  <div className="avatarmini">👤</div>

                  <div className="course__author">
                    <div className="course__name">{course.author}</div>
                    <div className="course__sub">
                      {course.subtitle} • {course.level}
                    </div>
                  </div>

                  <div className="course__rating">
                    <Stars
                      value={course.rating}
                      onRate={(rating) => handleRate(course.id, rating)}
                    />
                    <span className="votes">({course.votes})</span>
                  </div>
                </div>

                <p className="course__desc">{course.description}</p>

                <div className="course__actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                  >
                    Voir le cours
                  </button>

                  <button
                    className={`btn btn--ghost ${
                      course.isFavorite ? "is-fav" : ""
                    }`}
                    onClick={() => handleFavorite(course.id)}
                  >
                    {course.isFavorite ? "★ Favori" : "☆ Ajouter"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="listWrap">
          {sortedCourses.map((course) => (
            <div key={course.id} className="listRow card card--pad">
              <div className="listMain">
                <div className="listTitle">{course.title}</div>
                <div className="listSub">
                  {course.author} • {course.level}
                </div>
                <div className="listDesc">{course.description}</div>
              </div>

              <div className="listRight">
                <Stars
                  value={course.rating}
                  onRate={(rating) => handleRate(course.id, rating)}
                />
                <span className="votes">({course.votes})</span>

                <button
                  className="btn btn--primary"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  Ouvrir
                </button>

                <button
                  className={`btn btn--ghost ${
                    course.isFavorite ? "is-fav" : ""
                  }`}
                  onClick={() => handleFavorite(course.id)}
                >
                  {course.isFavorite ? "★" : "☆"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}