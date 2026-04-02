import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTeacherQuizResults } from "../../api/quizzes";

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchResults() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchTeacherQuizResults(id);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement résultats :", error);
        setErrorMessage("Impossible de charger les résultats du quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [id]);

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Résultats du quiz</h1>
          <p className="teacher-subtitle">
            Consultez les tentatives des étudiants et leurs scores.
          </p>
        </div>

        <button className="btn btn--ghost" onClick={() => navigate("/teacher/quiz")}>
          Retour
        </button>
      </div>

      {isLoading && <p>Chargement des résultats...</p>}
      {!isLoading && errorMessage && <p style={{ color: "#c0392b" }}>{errorMessage}</p>}

      {!isLoading && !errorMessage && results.length === 0 && (
        <div className="card card--pad">
          <h2 className="card__title">Aucune tentative</h2>
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
                  Tentative #{result.numero_tentative} • {result.date_soumission || "—"}
                </div>
              </div>

              <div className="teacher-row__right">
                <span className="teacher-mini-kpi">
                  Score {result.score}/{result.score_max}
                </span>
                <span className="teacher-mini-kpi">
                  {result.pourcentage}%
                </span>
                <span className="teacher-mini-kpi">
                  {result.reussi ? "Réussi ✅" : "Échoué ❌"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}