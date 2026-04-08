import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  Eye,
  Pencil,
  GraduationCap,
  Filter,
  MoreHorizontal,
  X,
} from "lucide-react";
import "../../styles/teacher/courses.css";

export default function Courses() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsData, setStudentsData] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

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
      const res = await fetch(`http://127.0.0.1:8001/api/courses/${courseId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour.");
      }

      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  }

  async function openStudents(courseId) {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8001/api/courses/${courseId}/etudiants/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des étudiants.");
      }

      const data = await res.json();
      setStudentsData(data);
      setSelectedCourseId(courseId);
      setShowStudentsModal(true);
    } catch (err) {
      console.error(err);
      alert("Impossible de charger les étudiants.");
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
          author: c.author || c.enseignant?.nom || "—",
          banner: c.banniere || null,
          status: c.status || "brouillon",
          students: c.etudiants_count ?? c.students ?? 0,
          lessons: c.lecons_count ?? c.lessons ?? 0,
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
        statusFilter === "all" || course.status?.toLowerCase() === statusFilter;

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
    if (status === "publie") return "teacher-course-badge teacher-course-badge--success";
    if (status === "brouillon") return "teacher-course-badge teacher-course-badge--warn";
    return "teacher-course-badge teacher-course-badge--muted";
  };

  if (loading) {
    return (
      <section className="teacher-courses-page">
        <div className="teacher-courses-hero">
          <div>
            <div className="teacher-courses-eyebrow">Cours</div>
            <h1 className="teacher-courses-title">Gestion des cours</h1>
            <p className="teacher-courses-subtitle">Chargement des cours...</p>
          </div>
        </div>

        <div className="teacher-courses-grid">
          {[1, 2, 3].map((item) => (
            <article key={item} className="teacher-course-card teacher-course-card--skeleton">
              <div className="teacher-course-card__banner teacher-course-skeleton" />
              <div className="teacher-course-card__body">
                <div className="teacher-course-skeleton teacher-course-skeleton--title" />
                <div className="teacher-course-skeleton teacher-course-skeleton--line" />
                <div className="teacher-course-skeleton teacher-course-skeleton--line short" />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="teacher-courses-page">
        <div className="teacher-courses-hero">
          <div>
            <div className="teacher-courses-eyebrow">Cours</div>
            <h1 className="teacher-courses-title">Gestion des cours</h1>
            <p className="teacher-courses-subtitle teacher-courses-error">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="teacher-courses-page">
      <div className="teacher-courses-hero">
        <div>
          <div className="teacher-courses-eyebrow">Cours</div>
          <h1 className="teacher-courses-title">Gestion des cours</h1>
          <p className="teacher-courses-subtitle">
            Organisez vos contenus, consultez vos étudiants et gérez le statut de publication.
          </p>
        </div>

        <button
          className="teacher-courses-create-btn"
          onClick={() => navigate("/teacher/courses/create")}
          type="button"
        >
          <Plus size={18} />
          <span>Créer un cours</span>
        </button>
      </div>

      <div className="teacher-courses-toolbar">
        <div className="teacher-courses-search">
          <Search size={18} />
          <input
            placeholder="Rechercher un cours ou un enseignant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="teacher-courses-tabs">
          <div className="teacher-courses-tabs__label">
            <Filter size={15} />
            <span>Filtrer</span>
          </div>

          {FILTERS.map((s) => (
            <button
              key={s}
              className={`teacher-courses-tab ${statusFilter === s ? "is-active" : ""}`}
              onClick={() => setStatusFilter(s)}
              type="button"
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
      </div>

      <div className="teacher-courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="teacher-courses-empty">
            <GraduationCap size={22} />
            <span>Aucun cours trouvé.</span>
          </div>
        ) : (
          filteredCourses.map((c) => (
            <article key={c.id} className="teacher-course-card">
              <div
                className="teacher-course-card__banner"
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
                {!c.banner && (
                  <div className="teacher-course-card__banner-placeholder">
                    <BookOpen size={28} />
                  </div>
                )}

                <div className="teacher-course-card__overlay">
                  <div className="teacher-course-card__overlay-top">
                    <span className={getStatusClass(c.status)}>
                      {getStatusLabel(c.status)}
                    </span>
                  </div>

                  <div className="teacher-course-card__overlay-bottom">
                    <h3>{c.title}</h3>
                  </div>
                </div>
              </div>

              <div className="teacher-course-card__body">
                <div className="teacher-course-card__author">
                  <div className="teacher-course-card__author-avatar">
                    {c.author?.charAt(0)?.toUpperCase() || "E"}
                  </div>

                  <div>
                    <div className="teacher-course-card__author-name">{c.author}</div>
                    <div className="teacher-course-card__author-role">Enseignant</div>
                  </div>
                </div>

                <div className="teacher-course-card__stats">
                  <div className="teacher-course-stat">
                    <Users size={15} />
                    <span>{c.students} étudiants</span>
                  </div>

                  <div className="teacher-course-stat">
                    <BookOpen size={15} />
                    <span>{c.lessons} leçons</span>
                  </div>
                </div>

                <div className="teacher-course-card__actions">
                  <button
                    className="teacher-course-btn teacher-course-btn--primary"
                    onClick={() => navigate(`/teacher/courses/${c.id}/edit`)}
                    type="button"
                  >
                    <Pencil size={16} />
                    <span>Modifier</span>
                  </button>

                  <button
                    className="teacher-course-btn teacher-course-btn--soft"
                    onClick={() => navigate(`/teacher/courses/${c.id}`)}
                    type="button"
                  >
                    <Eye size={16} />
                    <span>Voir</span>
                  </button>
                </div>

                <div className="teacher-course-card__footer">
                  <button
                    className="teacher-course-btn teacher-course-btn--ghost"
                    onClick={() => openStudents(c.id)}
                    type="button"
                  >
                    <Users size={16} />
                    <span>Étudiants</span>
                  </button>

                  <div className="teacher-course-status-select-wrap">
                    <MoreHorizontal size={15} />
                    <select
                      className="teacher-course-status-select"
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
            </article>
          ))
        )}
      </div>

      {showStudentsModal && studentsData && (
        <div
          className="teacher-course-modal-overlay"
          onClick={() => setShowStudentsModal(false)}
        >
          <div
            className="teacher-course-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="teacher-course-modal__head">
              <div>
                <h3>Étudiants inscrits</h3>
                <p>
                  Cours #{selectedCourseId} • {studentsData.count} étudiant
                  {studentsData.count > 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                className="teacher-course-modal__close"
                onClick={() => setShowStudentsModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {studentsData.students.length === 0 ? (
              <div className="teacher-course-modal__empty">
                Aucun étudiant inscrit
              </div>
            ) : (
              <div className="teacher-course-students-list">
                {studentsData.students.map((s) => (
                  <div key={s.id} className="teacher-course-student-row">
                    <div className="teacher-course-student-row__left">
                      <div className="teacher-course-student-row__avatar">
                        {s.username?.charAt(0)?.toUpperCase() || "E"}
                      </div>

                      <div>
                        <div className="teacher-course-student-row__name">
                          {s.username}
                        </div>
                        <div className="teacher-course-student-row__email">
                          {s.email}
                        </div>
                      </div>
                    </div>

                    <div className="teacher-course-student-row__right">
                      <span>{s.progression}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="teacher-course-modal__actions">
              <button
                className="teacher-course-btn teacher-course-btn--soft"
                onClick={() => setShowStudentsModal(false)}
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}