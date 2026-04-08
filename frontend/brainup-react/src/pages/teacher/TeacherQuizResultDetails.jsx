import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Users,
  BarChart3,
  Trophy,
  CircleCheckBig,
  CircleX,
  Clock3,
  ClipboardList,
} from "lucide-react";
import "../../styles/teacher/teacher-quiz-result-details.css";

export default function TeacherQuizResultDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchQuizResults() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://127.0.0.1:8001/api/teacher/quizzes/${quizId}/results/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les résultats du quiz.");
        }

        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement résultats du quiz :", error);
        setErrorMessage("Impossible de charger les résultats du quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizResults();
  }, [quizId]);

  const summary = useMemo(() => {
    if (!results.length) {
      return {
        attempts: 0,
        average: "0%",
        success: 0,
      };
    }

    const attempts = results.length;
    const success = results.filter((item) => item.reussi).length;
    const averageValue =
      results.reduce((sum, item) => sum + Number(item.pourcentage || 0), 0) /
      attempts;

    return {
      attempts,
      average: `${Math.round(averageValue)}%`,
      success,
    };
  }, [results]);

  function formatDate(value) {
    if (!value) return "Date inconnue";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return "Date inconnue";
    }
  }

  return (
    <section className="teacher-quiz-result-details-page">
      <div className="teacher-quiz-result-details-hero">
        <div>
          <div className="teacher-quiz-result-details-eyebrow">
            <Sparkles size={14} />
            <span>Analyse détaillée</span>
          </div>

          <h1 className="teacher-quiz-result-details-title">
            Résultats détaillés du quiz
          </h1>
          <p className="teacher-quiz-result-details-subtitle">
            Consultez les étudiants ayant passé ce quiz, leurs tentatives et
            leurs performances.
          </p>
        </div>

        <button
          className="teacher-quiz-result-details-back"
          onClick={() => navigate("/teacher/quiz")}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Retour</span>
        </button>
      </div>

      {isLoading && (
        <div className="teacher-quiz-result-details-skeleton-grid">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="teacher-quiz-result-details-skeleton-card"
            >
              <div className="teacher-quiz-result-details-skeleton teacher-quiz-result-details-skeleton--title" />
              <div className="teacher-quiz-result-details-skeleton teacher-quiz-result-details-skeleton--line" />
              <div className="teacher-quiz-result-details-skeleton teacher-quiz-result-details-skeleton--line short" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="teacher-quiz-result-details-feedback teacher-quiz-result-details-feedback--error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="teacher-quiz-result-details-kpis">
            <div className="teacher-quiz-result-details-kpi">
              <div className="teacher-quiz-result-details-kpi__icon teacher-quiz-result-details-kpi__icon--blue">
                <ClipboardList size={18} />
              </div>
              <div>
                <strong>{summary.attempts}</strong>
                <span>Tentatives</span>
              </div>
            </div>

            <div className="teacher-quiz-result-details-kpi">
              <div className="teacher-quiz-result-details-kpi__icon teacher-quiz-result-details-kpi__icon--purple">
                <BarChart3 size={18} />
              </div>
              <div>
                <strong>{summary.average}</strong>
                <span>Moyenne</span>
              </div>
            </div>

            <div className="teacher-quiz-result-details-kpi">
              <div className="teacher-quiz-result-details-kpi__icon teacher-quiz-result-details-kpi__icon--green">
                <Trophy size={18} />
              </div>
              <div>
                <strong>{summary.success}</strong>
                <span>Réussites</span>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="teacher-quiz-result-details-empty">
              <Users size={24} />
              <div>
                <h3>Aucun résultat</h3>
                <p>Aucun étudiant n’a encore soumis ce quiz.</p>
              </div>
            </div>
          ) : (
            <div className="teacher-quiz-result-details-list">
              {results.map((result) => (
                <article
                  key={result.id}
                  className="teacher-quiz-result-details-card"
                >
                  <div className="teacher-quiz-result-details-card__left">
                    <div className="teacher-quiz-result-details-card__avatar">
                      {result.etudiant_nom?.charAt(0)?.toUpperCase() || "E"}
                    </div>

                    <div className="teacher-quiz-result-details-card__identity">
                      <h3>{result.etudiant_nom}</h3>
                      <p>Tentative #{result.numero_tentative}</p>
                    </div>
                  </div>

                  <div className="teacher-quiz-result-details-card__right">
                    <span className="teacher-quiz-result-details-pill">
                      Score {result.score}/{result.score_max}
                    </span>

                    <span className="teacher-quiz-result-details-pill">
                      {result.pourcentage}%
                    </span>

                    <span
                      className={`teacher-quiz-result-details-pill ${
                        result.reussi
                          ? "teacher-quiz-result-details-pill--success"
                          : "teacher-quiz-result-details-pill--danger"
                      }`}
                    >
                      {result.reussi ? (
                        <>
                          <CircleCheckBig size={14} />
                          <span>Réussi</span>
                        </>
                      ) : (
                        <>
                          <CircleX size={14} />
                          <span>Échoué</span>
                        </>
                      )}
                    </span>

                    <span className="teacher-quiz-result-details-pill teacher-quiz-result-details-pill--date">
                      <Clock3 size={14} />
                      <span>{formatDate(result.date_soumission)}</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}