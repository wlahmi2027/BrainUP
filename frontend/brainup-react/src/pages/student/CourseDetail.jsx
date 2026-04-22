import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import {
  BookOpen,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  GraduationCap,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../../styles/student/course-detail.css";

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

  const activeStartRef = useRef(null);
  const accumulatedMsRef = useRef(0);
  const flushIntervalRef = useRef(null);

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

  function startStudyTimer() {
    if (!selectedLesson?.id) return;
    if (document.hidden) return;
    if (activeStartRef.current !== null) return;

    activeStartRef.current = Date.now();
  }

  function pauseStudyTimer() {
    if (activeStartRef.current === null) return;

    accumulatedMsRef.current += Date.now() - activeStartRef.current;
    activeStartRef.current = null;
  }

  async function flushStudyTime() {
    pauseStudyTimer();

    const durationMinutes = Math.floor(accumulatedMsRef.current / 60000);

    if (!selectedLesson?.id || durationMinutes <= 0) {
      startStudyTimer();
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:8001/api/student/courses/${id}/study-session/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lesson_id: selectedLesson.id,
            duration_minutes: durationMinutes,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Erreur temps étude:", data);
      } else {
        accumulatedMsRef.current = accumulatedMsRef.current % 60000;
      }
    } catch (error) {
      console.error("Erreur temps étude:", error);
    }

    startStudyTimer();
  }

  useEffect(() => {
    if (!selectedLesson?.id) return;

    accumulatedMsRef.current = 0;
    activeStartRef.current = null;

    function handleVisibilityChange() {
      if (document.hidden) {
        pauseStudyTimer();
      } else {
        startStudyTimer();
      }
    }

    function handleBeforeUnload() {
      pauseStudyTimer();

      const durationMinutes = Math.floor(accumulatedMsRef.current / 60000);
      if (!selectedLesson?.id || durationMinutes <= 0) return;

      const payload = JSON.stringify({
        lesson_id: selectedLesson.id,
        duration_minutes: durationMinutes,
      });

      try {
        navigator.sendBeacon?.(
          `http://localhost:8001/api/student/courses/${id}/study-session/`,
          new Blob([payload], { type: "application/json" })
        );
      } catch (error) {
        console.error("Erreur beacon temps étude:", error);
      }
    }

    startStudyTimer();

    flushIntervalRef.current = setInterval(() => {
      flushStudyTime();
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(flushIntervalRef.current);
      pauseStudyTimer();
      flushStudyTime();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedLesson?.id, id]);

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

  if (loading) {
    return (
      <section className="student-course-detail-page">
        <div className="student-course-detail-loading">
          Chargement du cours...
        </div>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="student-course-detail-page">
        <div className="student-course-detail-loading">Cours introuvable.</div>
      </section>
    );
  }

  const progress = Math.round(course.inscription?.progression_percent || 0);

  return (
    <section className="student-course-detail-page">
      <div className="student-course-detail-hero">
        <div>
          <div className="student-course-detail-eyebrow">
            <GraduationCap size={14} />
            <span>Espace d’apprentissage</span>
          </div>

          <h1 className="student-course-detail-title">{course.title}</h1>

          <div className="student-course-detail-meta">
            <span>
              <UserRound size={15} />
              {course.enseignant?.nom || "Enseignant"}
            </span>
            <span>
              <BookOpen size={15} />
              {course.niveau}
            </span>
          </div>
        </div>

        <div className="student-course-detail-progress-card">
          <span>Progression globale</span>
          <strong>{progress}%</strong>
        </div>
      </div>

      <div className="student-course-detail-layout">
        <aside className="student-course-detail-sidebar">
          <div className="student-course-detail-sidebar__head">
            <h3>Leçons</h3>
            <span>{course.lecons?.length || 0}</span>
          </div>

          {course.lecons?.length === 0 ? (
            <div className="student-course-detail-empty">
              Aucune leçon disponible
            </div>
          ) : (
            <div className="student-course-detail-lessons">
              {course.lecons?.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  className={`student-course-detail-lesson ${
                    selectedLesson?.id === lesson.id ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className="student-course-detail-lesson__left">
                    <div className="student-course-detail-lesson__index">
                      {index + 1}
                    </div>

                    <div className="student-course-detail-lesson__text">
                      <strong>{lesson.titre}</strong>
                      <span>
                        {selectedLesson?.id === lesson.id
                          ? "Leçon ouverte"
                          : "Cliquer pour ouvrir"}
                      </span>
                    </div>
                  </div>

                  {selectedLesson?.id === lesson.id && (
                    <CheckCircle2 size={16} />
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="student-course-detail-content">
          {!selectedLesson ? (
            <div className="student-course-detail-placeholder">
              Sélectionnez une leçon
            </div>
          ) : (
            <div className="student-course-detail-viewer-card">
              <div className="student-course-detail-viewer-head">
                <div>
                  <h2>{selectedLesson.titre}</h2>
                  <p>
                    {lessonFile
                      ? "Visualisation du support PDF"
                      : "Contenu de la leçon"}
                  </p>
                </div>

                <div className="student-course-detail-viewer-actions">
                  <button
                    type="button"
                    className="student-course-detail-zoom-btn"
                    onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
                  >
                    <ZoomOut size={16} />
                  </button>

                  <span className="student-course-detail-zoom-value">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    type="button"
                    className="student-course-detail-zoom-btn"
                    onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}
                  >
                    <ZoomIn size={16} />
                  </button>

                  <button
                    type="button"
                    className="student-course-detail-reset-btn"
                    onClick={() => setZoom(1)}
                  >
                    <RotateCcw size={15} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="student-course-detail-viewer-body">
                {lessonFile ? (
                  <>
                    <div className="student-course-detail-download">
                      <a
                        href={lessonFile}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="student-course-detail-download-btn"
                      >
                        <Download size={16} />
                        <span>Télécharger le PDF</span>
                      </a>
                    </div>

                    <div ref={viewerRef} className="student-course-detail-pdf">
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
                            className="student-course-detail-pdf-page"
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
                  <div className="student-course-detail-text-content">
                    <div className="student-course-detail-text-box">
                      <FileText size={18} />
                      <p>{selectedLesson.contenu}</p>
                    </div>
                  </div>
                ) : (
                  <div className="student-course-detail-empty">
                    Contenu non disponible
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}