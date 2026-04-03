import { useEffect, useState } from "react";
import { getStudentQuizzes } from "../../api/quizzes";
import { useNavigate } from "react-router-dom";
import {
  FileQuestion,
  Clock3,
  BookOpen,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import "../../styles/student/quiz.css";

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
    <section className="student-quiz-page">
      <div className="student-quiz-head">
        <div>
          <span className="student-quiz-eyebrow">Quiz</span>
          <h1 className="student-quiz-title">Quiz disponibles</h1>
          <p className="student-quiz-subtitle">
            Retrouvez ici les quiz publiés par vos enseignants.
          </p>
        </div>

        <div className="student-quiz-live-badge">
          <Sparkles size={16} />
          Prêt à s'entraîner
        </div>
      </div>

      {isLoading && (
        <div className="student-quiz-grid">
          <div className="student-quiz-skeleton" />
          <div className="student-quiz-skeleton" />
          <div className="student-quiz-skeleton" />
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="student-quiz-empty student-quiz-empty--error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && quizzes.length === 0 && (
        <div className="student-quiz-empty">
          Aucun quiz publié n’est disponible pour le moment.
        </div>
      )}

      {!isLoading && !errorMessage && quizzes.length > 0 && (
        <div className="student-quiz-grid">
          {quizzes.map((quiz) => (
            <article key={quiz.id} className="student-quiz-card">
              <div className="student-quiz-card__top">
                <div className="student-quiz-card__icon">
                  <FileQuestion size={22} />
                </div>

                <span className="student-quiz-card__tag">Disponible</span>
              </div>

              <h2 className="student-quiz-card__title">{quiz.titre}</h2>

              <p className="student-quiz-card__course">
                <BookOpen size={15} />
                <span>{quiz.cours_title || `Cours #${quiz.cours}`}</span>
              </p>

              <div className="student-quiz-card__meta">
                <div className="student-quiz-card__meta-item">
                  <FileQuestion size={15} />
                  <span>
                    {quiz.questions_count || 0} question
                    {(quiz.questions_count || 0) > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="student-quiz-card__meta-item">
                  <Clock3 size={15} />
                  <span>{quiz.temps_limite_minutes || 0} min</span>
                </div>
              </div>

              <button
                className="student-quiz-card__action"
                onClick={() => navigate(`/student/quiz/${quiz.id}`)}
              >
                <PlayCircle size={17} />
                <span>Commencer</span>
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}