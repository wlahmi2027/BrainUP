import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:8001/api/student/courses/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!course) return <p>Cours introuvable.</p>;

  const progress = course.inscription?.progression || 0;

  return (
    <section className="page">
      {/* ===== HEADER ===== */}
      <div className="page__header">
        <div>
          <h1 className="page__title">{course.title}</h1>
          <p className="course__sub">
            Enseignant : <strong>{course.enseignant?.nom}</strong>
          </p>
        </div>

        <span className="badgeOk">{course.niveau}</span>
      </div>

      {/* ===== GRID ===== */}
      <div className="grid">
        {/* ===== LEFT: DESCRIPTION ===== */}
        <div className="card span-2">
          <div className="card__head">
            <h2>Description</h2>
          </div>
          <div style={{ padding: "0 18px 18px" }}>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              {course.description}
            </p>
          </div>
        </div>

        {/* ===== RIGHT: PROGRESS ===== */}
        <div className="card">
          <div className="card__head">
            <h2>Progression</h2>
          </div>

          <div className="progress">
            <div
              className="donut"
              style={{
                background: `conic-gradient(#2fa5ff 0 ${progress}%, #eaf2ff ${progress}% 100%)`,
              }}
            >
              <div className="donut__center">
                <div className="donut__pct">{progress}%</div>
                <div className="donut__label">Complété</div>
              </div>
            </div>

            <div className="stats">
              <div className="stat">
                <span className="dot blue">•</span> Leçons :{" "}
                {course.lecons_count}
              </div>

              <div className="stat">
                <span className="dot green">•</span> Étudiants :{" "}
                {course.etudiants_count}
              </div>

              <div className="stat">
                <span className="dot yellow">•</span> Note :{" "}
                {course.inscription?.note_moyenne ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ===== EXTRA INFO ===== */}
        <div className="card span-2">
          <div className="card__head">
            <h2>Votre activité</h2>
          </div>

          <div style={{ padding: "0 18px 18px" }}>
            <ul className="checklist">
              <li>
                <span className="check">✓</span>
                Progression :{" "}
                <span className="muted">{progress}% complété</span>
              </li>

              <li>
                <span className="check">✓</span>
                Note moyenne :{" "}
                <span className="muted">
                  {course.inscription?.note_moyenne ?? "Non évalué"}
                </span>
              </li>

              <li>
                <span className="check">✓</span>
                Favori :{" "}
                <span className="muted">
                  {course.inscription?.favoris ? "Oui" : "Non"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}