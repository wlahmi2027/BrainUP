import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonFile, setNewLessonFile] = useState(null);
  async function handleCreateLesson(e) {
    e.preventDefault();

    if (!course) return; // ✅ prevent crash

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("titre", newLessonTitle);
    formData.append("ordre", (course.lecons?.length || 0) + 1);
    formData.append("cours", course.id);

    if (newLessonFile) {
      formData.append("contenu", newLessonFile);
    }

    await fetch("http://localhost:8001/api/lecons/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    setShowModal(false);
    setNewLessonTitle("");
    setNewLessonFile(null);

    await fetchCourse();
  }

  async function editLesson(lesson) {
    const titre = prompt("Nouveau titre:", lesson.titre);
    if (!titre) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8001/api/lecons/${lesson.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ titre }),
    });

    await fetchCourse();
  }
  async function deleteLesson(lessonId) {
    if (!window.confirm("Supprimer cette leçon ?")) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8001/api/lecons/${lessonId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await fetchCourse();
  }
  async function fetchCourse() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8001/api/admin/courses/${id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setCourse(data);

    if (data.lecons?.length) {
      setSelectedLesson(data.lecons[0]);
    }

    setLoading(false);
  }
  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!course) return <p>Cours introuvable.</p>;

  return (
    <section className="player">
      {/* ===== HEADER ===== */}
      <div className="player__header">
        <div>
          <h1>{course.titre}</h1>
          <p>
            {course.enseignant?.nom} • {course.niveau}
          </p>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="player__layout">
        {/* ===== SIDEBAR ===== */}
        <aside className="player__sidebar">
          <div>
            <h3>Leçons</h3>
          </div>

          {course.lecons?.length === 0 && (
            <p className="muted">Aucune leçon disponible</p>
          )}

          {course.lecons?.map((lesson) => (
            <div
              key={lesson.id}
              className={`lesson ${selectedLesson?.id === lesson.id ? "is-active" : ""
                }`}
              onClick={() => setSelectedLesson(lesson)}
            >
              <span className="lesson__title">{lesson.titre}</span>

              <div className="lesson-actions">
                <button onClick={(e) => { e.stopPropagation(); editLesson(lesson); }}>
                  ✏️
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
          <div>
            <button className="btn btn--primary"
              onClick={() => setShowModal(true)}
              disabled={!course}>
              + Ajouter une leçon
            </button>
          </div>
        </aside>

        {/* ===== CONTENT ===== */}
        <main className="player__content">
          {!selectedLesson ? (
            <div className="card card--pad">
              Sélectionnez une leçon
            </div>
          ) : (
            <div className="card">
              <div className="card__head">
                <h2>{selectedLesson.titre}</h2>
              </div>

              <div className="lesson__content">
                {selectedLesson.contenu &&
                  selectedLesson.contenu.endsWith(".pdf") ? (
                  <>
                    <div style={{ marginBottom: "10px" }}>
                      <a
                        href={selectedLesson.contenu}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                      >
                        Télécharger le PDF
                      </a>
                    </div>

                    <iframe
                      src={selectedLesson.contenu}
                      width="100%"
                      height="600px"
                    />
                  </>
                ) : (
                  <p className="muted">Contenu non disponible</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Créer une leçon</h3>

            <form onSubmit={handleCreateLesson}>
              <div>
                <label>Titre</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>PDF (optionnel)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewLessonFile(e.target.files[0])}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn--primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );

}