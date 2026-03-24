import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseDetail() {
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function fetchCourse() {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8001/api/student/courses/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setCourse(data);

      // select first lesson by default
      if (data.lecons?.length) {
        setSelectedLesson(data.lecons[0]);
      }

      setLoading(false);
    }

    fetchCourse();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!course) return <p>Cours introuvable.</p>;

  const progress = course.inscription?.progression || 0;

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

        <div className="player__progress">
          {progress}% complété
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="player__layout">
        {/* ===== SIDEBAR (LESSONS) ===== */}
        <aside className="player__sidebar">
          <h3>Leçons</h3>

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
            </div>
          ))}
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
                {selectedLesson.contenu && selectedLesson.contenu.endsWith(".pdf") ? (
                  <>
                    {/* DOWNLOAD BUTTON */}
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

                    {/* PDF VIEWER */}
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
    </section>
  );
}