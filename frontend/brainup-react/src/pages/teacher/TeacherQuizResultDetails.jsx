import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Résultats du quiz</h1>
          <p className="teacher-subtitle">
            Consultez les étudiants ayant passé ce quiz.
          </p>
        </div>

        <button
          className="btn btn--ghost"
          onClick={() => navigate("/teacher/quiz")}
        >
          ← Retour
        </button>
      </div>

      {isLoading && (
        <div className="card card--pad">
          <p>Chargement des résultats...</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="card card--pad">
          <p style={{ color: "#c0392b" }}>{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && results.length === 0 && (
        <div className="card card--pad">
          <h2 className="card__title">Aucun résultat</h2>
          <p className="teacher-subtitle" style={{ marginTop: 10 }}>
            Aucun étudiant n’a encore soumis ce quiz.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && results.length > 0 && (
        <div className="teacher-list teacher-list--space">
          {results.map((result) => (
            <div key={result.id} className="teacher-row teacher-row--card">
              <div>
                <div className="teacher-row__title">{result.etudiant_nom}</div>
                <div className="teacher-row__meta">
                  Tentative #{result.numero_tentative} • Score {result.score}/
                  {result.score_max} • {result.pourcentage}%
                </div>
              </div>

              <div className="teacher-row__right">
                <span className="teacher-mini-kpi">
                  {result.reussi ? "✅ Réussi" : "❌ Échoué"}
                </span>

                <span className="teacher-mini-kpi">
                  {result.date_soumission
                    ? new Date(result.date_soumission).toLocaleString()
                    : "Date inconnue"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}