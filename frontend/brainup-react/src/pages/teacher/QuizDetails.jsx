import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
        setErrorMessage("");

        const quizResponse = await fetch(`http://127.0.0.1:8001/api/quiz/${id}/`);
        if (!quizResponse.ok) {
          throw new Error("Impossible de charger le quiz.");
        }
        const quizData = await quizResponse.json();

        const questionsResponse = await fetch(
          `http://127.0.0.1:8001/api/questions/?quiz=${id}`
        );
        if (!questionsResponse.ok) {
          throw new Error("Impossible de charger les questions.");
        }
        const questionsData = await questionsResponse.json();

        const questionsWithChoices = await Promise.all(
          questionsData.map(async (question) => {
            const choicesResponse = await fetch(
              `http://127.0.0.1:8001/api/choix/?question=${question.id}`
            );
            const choicesData = choicesResponse.ok ? await choicesResponse.json() : [];
            return {
              ...question,
              choix: choicesData,
            };
          })
        );

        setQuiz(quizData);
        setQuestions(questionsWithChoices);
      } catch (error) {
        console.error(error);
        setErrorMessage("Erreur lors du chargement du détail du quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizDetails();
  }, [id]);

  if (isLoading) {
    return <section className="page teacher-page"><p>Chargement...</p></section>;
  }

  if (errorMessage) {
    return <section className="page teacher-page"><p style={{ color: "red" }}>{errorMessage}</p></section>;
  }

  if (!quiz) {
    return <section className="page teacher-page"><p>Quiz introuvable.</p></section>;
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">{quiz.titre}</h1>
          <p className="teacher-subtitle">
            {quiz.cours_title || `Cours #${quiz.cours}`} • {quiz.questions_count} question
            {quiz.questions_count > 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn btn--ghost"
            onClick={() => navigate(`/teacher/quiz/${quiz.id}/edit`)}
          >
            Modifier
          </button>
          <button
            className="btn btn--primary"
            onClick={() => navigate("/teacher/quiz")}
          >
            Retour
          </button>
        </div>
      </div>

      <div className="card card--pad" style={{ marginBottom: 20 }}>
        <h2 className="card__title">Informations générales</h2>
        <p><strong>Niveau :</strong> {quiz.niveau}</p>
        <p><strong>Durée :</strong> {quiz.temps_limite_minutes} minutes</p>
        <p><strong>Statut :</strong> {quiz.statut}</p>
        <p><strong>Description :</strong> {quiz.description || "Aucune description"}</p>
      </div>

      <div className="teacher-list teacher-list--space">
        {questions.map((question, index) => (
          <div key={question.id} className="teacher-row teacher-row--card" style={{ display: "block" }}>
            <div className="teacher-row__title">
              Question {index + 1} — {question.enonce}
            </div>
            <div className="teacher-row__meta" style={{ marginTop: 8 }}>
              {question.points} point{question.points > 1 ? "s" : ""}
            </div>

            <div style={{ marginTop: 14 }}>
              {question.choix?.map((choice) => (
                <div key={choice.id} style={{ marginBottom: 6 }}>
                  {choice.est_correct ? "✅" : "•"} {choice.texte}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}