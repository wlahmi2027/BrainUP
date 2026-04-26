import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import "../../styles/teacher/course-detail.css";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonFile, setNewLessonFile] = useState(null);

  async function fetchCourse() {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8001/api/courses/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setCourse(data);

    if (data.lecons?.length) {
      setSelectedLesson(data.lecons[0]);
    } else {
      setSelectedLesson(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchCourse();
  }, [id]);

  async function handleCreateLesson(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("titre", newLessonTitle);
    formData.append("ordre", (course.lecons?.length || 0) + 1);
    formData.append("cours", course.id);
    formData.append("contenu", newLessonTitle || "Contenu");

    if (newLessonFile) {
      formData.append("fichier", newLessonFile);
    }

    await fetch("http://localhost:8001/api/lecons/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setShowModal(false);
    setNewLessonTitle("");
    setNewLessonFile(null);

    fetchCourse();
  }

  async function deleteLesson(id) {
    if (!window.confirm("Supprimer ?")) return;

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8001/api/lecons/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchCourse();
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

    fetchCourse();
  }

  if (loading) return <p>Chargement...</p>;
  if (!course) return <p>Cours introuvable</p>;

  return (
    <section className="course-detail">
      {/* HEADER */}
      <div className="course-detail__header">
        <div>
          <h1>{course.title}</h1>
          <p>{course.enseignant?.nom} • {course.niveau}</p>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="course-detail__layout">

        {/* SIDEBAR */}
        <aside className="course-detail__sidebar">
          <div className="sidebar__head">
            <BookOpen size={18} />
            <h3>Leçons</h3>
          </div>

          <div className="sidebar__list">
            {course.lecons?.length === 0 && (
              <p className="muted">Aucune leçon</p>
            )}

            {course.lecons?.map((lesson) => (
              <div
                key={lesson.id}
                className={`lesson-item ${
                  selectedLesson?.id === lesson.id ? "active" : ""
                }`}
                onClick={() => setSelectedLesson(lesson)}
              >
                <span>{lesson.titre}</span>

                <div className="lesson-item__actions">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    editLesson(lesson);
                  }}>
                    <Pencil size={14} />
                  </button>

                  <button onClick={(e) => {
                    e.stopPropagation();
                    deleteLesson(lesson.id);
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="add-lesson-btn"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Ajouter une leçon
          </button>
        </aside>

        {/* CONTENT */}
        <main className="course-detail__content">
          {!selectedLesson ? (
            <div className="empty-state">
              <FileText size={30} />
              <p>Sélectionnez une leçon</p>
            </div>
          ) : (
            <div className="lesson-view">
              <h2>{selectedLesson.titre}</h2>

              {selectedLesson.fichier ? (
                <>
                  <a
                    href={selectedLesson.fichier}
                    target="_blank"
                    rel="noreferrer"
                    className="download-btn"
                  >
                    <Download size={16} />
                    Télécharger
                  </a>

                  <iframe
                    src={selectedLesson.fichier}
                    title="pdf"
                    width="100%"
                    height="600px"
                  />
                </>
              ) : (
                <p>{selectedLesson.contenu}</p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Créer une leçon</h3>

            <form onSubmit={handleCreateLesson}>
              <input
                placeholder="Titre"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                required
              />

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setNewLessonFile(e.target.files[0])}
              />

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