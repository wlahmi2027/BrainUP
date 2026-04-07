import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  FileQuestion,
  Clock,
  Layers,
  CheckCircle,
  Circle,
  Sparkles,
} from "lucide-react";
import "../../styles/teacher/quizDetails.css";

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        setIsLoading(true);

        const quizResponse = await fetch(`http://127.0.0.1:8001/api/quiz/${id}/`);
        const quizData = await quizResponse.json();

        const questionsResponse = await fetch(
          `http://127.0.0.1:8001/api/questions/?quiz=${id}`
        );
        const questionsData = await questionsResponse.json();

        const questionsWithChoices = await Promise.all(
          questionsData.map(async (question) => {
            const choicesResponse = await fetch(
              `http://127.0.0.1:8001/api/choix/?question=${question.id}`
            );
            const choicesData = choicesResponse.ok ? await choicesResponse.json() : [];
            return { ...question, choix: choicesData };
          })
        );

        setQuiz(quizData);
        setQuestions(questionsWithChoices);
      } catch (error) {
        setErrorMessage("Erreur lors du chargement.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizDetails();
  }, [id]);

  if (isLoading) return <p>Chargement...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;
  if (!quiz) return <p>Quiz introuvable</p>;

  return (
    <section className="teacher-quiz-details">
      {/* HEADER */}
      <div className="teacher-quiz-details__header">
        <div>
          <div className="teacher-quiz-details__eyebrow">
            <Sparkles size={14} />
            <span>Détail du quiz</span>
          </div>

          <h1>{quiz.titre}</h1>

          <p>
            {quiz.cours_title || `Cours #${quiz.cours}`} •{" "}
            {quiz.questions_count} question
            {quiz.questions_count > 1 ? "s" : ""}
          </p>
        </div>

        <div className="teacher-quiz-details__actions">
          <button
            className="btn btn--ghost"
            onClick={() => navigate("/teacher/quiz")}
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          <button
            className="btn btn--primary"
            onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
          >
            <Pencil size={16} />
            Modifier
          </button>
        </div>
      </div>

      {/* INFOS */}
      <div className="teacher-quiz-details__grid">
        <div className="teacher-quiz-details__card">
          <div className="card-head">
            <FileQuestion size={18} />
            <h3>Informations</h3>
          </div>

          <div className="card-body">
            <p><strong>Niveau :</strong> {quiz.niveau}</p>
            <p>
              <Clock size={14} /> {quiz.temps_limite_minutes} minutes
            </p>
            <p>
              <Layers size={14} /> {quiz.statut}
            </p>
            <p>{quiz.description || "Aucune description"}</p>
          </div>
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="teacher-quiz-details__questions">
        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <div className="question-card__header">
              <div className="question-number">{index + 1}</div>

              <div>
                <h3>{q.enonce}</h3>
                <span>{q.points} point{q.points > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="question-choices">
              {q.choix?.map((choice) => (
                <div
                  key={choice.id}
                  className={`choice ${
                    choice.est_correct ? "is-correct" : ""
                  }`}
                >
                  {choice.est_correct ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                  <span>{choice.texte}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}