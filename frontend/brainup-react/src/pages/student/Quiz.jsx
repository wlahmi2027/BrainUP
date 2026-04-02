import { useEffect, useState } from "react";
import { getStudentQuizzes } from "../../api/quizzes";
import { useNavigate } from "react-router-dom";

export default function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStudentQuizzes() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getStudentQuizzes();
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement quiz étudiant :", error);
        setErrorMessage("Impossible de charger les quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudentQuizzes();
  }, []);

  return (
    <section className="page student-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Quiz disponibles</h1>
          <p className="teacher-subtitle">
            Retrouvez ici les quiz publiés par vos enseignants.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="card card--pad">
          <p>Chargement des quiz...</p>
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="card card--pad">
          <p style={{ color: "#c0392b" }}>{errorMessage}</p>
        </div>
      )}

      {!isLoading && !errorMessage && quizzes.length === 0 && (
        <div className="card card--pad">
          <h2 className="card__title">Aucun quiz disponible</h2>
          <p className="teacher-subtitle" style={{ marginTop: 10 }}>
            Aucun quiz publié n’est disponible pour le moment.
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && quizzes.length > 0 && (
        <div className="teacher-list teacher-list--space">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="teacher-row teacher-row--card">
              <div>
                <div className="teacher-row__title">{quiz.titre}</div>
                <div className="teacher-row__meta">
                  {quiz.cours_title || `Cours #${quiz.cours}`} •{" "}
                  {quiz.questions_count || 0} question
                  {(quiz.questions_count || 0) > 1 ? "s" : ""} •{" "}
                  {quiz.temps_limite_minutes || 0} min
                </div>
              </div>

              <div className="teacher-row__right">
                <button
                  className="btn btn--primary"
                  onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                >
                  Commencer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}