import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [numPages, setNumPages] = useState(0);
  const [maxSeenPage, setMaxSeenPage] = useState(0);
  const [zoom, setZoom] = useState(1);

  const [pageWidth, setPageWidth] = useState(700);

  const viewerRef = useRef(null);
  const pageRefs = useRef([]);
  const lastSentPageRef = useRef(0);

  useEffect(() => {
    async function fetchCourse() {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `http://localhost:8001/api/student/courses/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Erreur lors du chargement du cours.");
        }

        const data = await res.json();
        setCourse(data);

        if (data.lecons?.length > 0) {
          setSelectedLesson(data.lecons[0]);
        } else {
          setSelectedLesson(null);
        }
      } catch (error) {
        console.error("Erreur chargement cours :", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  useEffect(() => {
    setNumPages(0);
    setMaxSeenPage(0);
    lastSentPageRef.current = 0;
    pageRefs.current = [];
    setZoom(1);
  }, [selectedLesson?.id]);

  const lessonFile = useMemo(() => {
    const rawFile =
      selectedLesson?.fichier || selectedLesson?.fichier_url || "";

    if (!rawFile) return null;

    if (rawFile.startsWith("http://") || rawFile.startsWith("https://")) {
      return rawFile;
    }

    return `http://localhost:8001${rawFile}`;
  }, [selectedLesson]);

  useEffect(() => {
    function updatePageWidth() {
      if (!viewerRef.current) return;
      const containerWidth = viewerRef.current.clientWidth;
      const safeWidth = Math.max(280, Math.floor(containerWidth - 40));
      setPageWidth(safeWidth);
    }

    updatePageWidth();
    window.addEventListener("resize", updatePageWidth);

    return () => {
      window.removeEventListener("resize", updatePageWidth);
    };
  }, [selectedLesson?.id]);

  async function sendLessonProgress(currentPage, totalPages) {
    if (!selectedLesson?.id || !totalPages) return;
    if (currentPage <= lastSentPageRef.current) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8001/api/student/courses/${id}/lesson-progress/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lesson_id: selectedLesson.id,
            current_page: currentPage,
            total_pages: totalPages,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Erreur progression:", data);
        return;
      }

      lastSentPageRef.current = currentPage;

      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          inscription: {
            ...(prev.inscription || {}),
            progression_percent:
              data.course_progression_percent ??
              prev.inscription?.progression_percent ??
              0,
            termine: data.terminee ?? prev.inscription?.termine ?? false,
          },
        };
      });
    } catch (error) {
      console.error("Erreur envoi progression:", error);
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    if (!viewerRef.current || !numPages || !lessonFile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let newMaxPage = maxSeenPage;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = Number(entry.target.dataset.pageNumber || 0);
            if (pageNumber > newMaxPage) {
              newMaxPage = pageNumber;
            }
          }
        });

        if (newMaxPage > maxSeenPage) {
          setMaxSeenPage(newMaxPage);
          sendLessonProgress(newMaxPage, numPages);
        }
      },
      {
        root: viewerRef.current,
        threshold: 0.6,
      }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [lessonFile, numPages, maxSeenPage, selectedLesson?.id]);

  if (loading) return <p>Chargement...</p>;
  if (!course) return <p>Cours introuvable.</p>;

  const progress = Math.round(course.inscription?.progression_percent || 0);

  return (
    <section className="player">
      <div
        className="player__header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>{course.title}</h1>
          <p>
            {course.enseignant?.nom} • {course.niveau}
          </p>
        </div>

        <div
          className="player__progress"
          style={{
            fontWeight: 600,
            fontSize: "18px",
            whiteSpace: "nowrap",
          }}
        >
          {progress}% complété
        </div>
      </div>

      <div className="player__layout">
        <aside className="player__sidebar">
          <h3>Leçons</h3>

          {course.lecons?.length === 0 && (
            <p className="muted">Aucune leçon disponible</p>
          )}

          {course.lecons?.map((lesson) => (
            <div
              key={lesson.id}
              className={`lesson ${
                selectedLesson?.id === lesson.id ? "is-active" : ""
              }`}
              onClick={() => setSelectedLesson(lesson)}
            >
              <span className="lesson__title">{lesson.titre}</span>
            </div>
          ))}
        </aside>

        <main className="player__content">
          {!selectedLesson ? (
            <div className="card card--pad">
              Sélectionnez une leçon
            </div>
          ) : (
            <div className="card">
              <div
                className="card__head"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <h2>{selectedLesson.titre}</h2>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
                  >
                    -
                  </button>

                  <span style={{ minWidth: "52px", textAlign: "center" }}>
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setZoom(1)}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="lesson__content">
                {lessonFile ? (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <a
                        href={lessonFile}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                      >
                        Télécharger le PDF
                      </a>
                    </div>

                    <div
                      ref={viewerRef}
                      style={{
                        height: "75vh",
                        overflowY: "auto",
                        overflowX: "auto",
                        border: "1px solid #d9e2f1",
                        borderRadius: "12px",
                        background: "#f8fafc",
                        padding: "16px",
                      }}
                    >
                      <Document
                        file={lessonFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) =>
                          console.error("Erreur chargement PDF:", error)
                        }
                        loading={<p>Chargement du PDF...</p>}
                        error={<p>Impossible de charger le PDF.</p>}
                      >
                        {Array.from({ length: numPages }, (_, index) => (
                          <div
                            key={`page_${index + 1}`}
                            data-page-number={index + 1}
                            ref={(el) => {
                              pageRefs.current[index] = el;
                            }}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              marginBottom: "20px",
                            }}
                          >
                            <Page
                              pageNumber={index + 1}
                              width={Math.floor(pageWidth * zoom)}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                            />
                          </div>
                        ))}
                      </Document>
                    </div>
                  </>
                ) : selectedLesson.contenu ? (
                  <p>{selectedLesson.contenu}</p>
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