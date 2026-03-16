import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function StudentQuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
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
        console.error("Erreur chargement quiz étudiant :", error);
        setErrorMessage("Impossible de charger ce quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizDetails();
  }, [id]);

  function handleSelectAnswer(questionId, choiceId) {
    if (hasSubmitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  }

  function handleValidate() {
    const newResults = {};

    questions.forEach((question) => {
      const selectedChoiceId = selectedAnswers[question.id];
      const selectedChoice = question.choix?.find(
        (choice) => choice.id === selectedChoiceId
      );

      newResults[question.id] = {
        isCorrect: Boolean(selectedChoice?.est_correct),
        correctChoiceId:
          question.choix?.find((choice) => choice.est_correct)?.id || null,
      };
    });

    setResults(newResults);
    setHasSubmitted(true);
  }

  if (isLoading) {
    return (
      <section className="page student-page">
        <p>Chargement du quiz...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="page student-page">
        <p style={{ color: "#c0392b" }}>{errorMessage}</p>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="page student-page">
        <p>Quiz introuvable.</p>
      </section>
    );
  }

  return (
    <section className="page student-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Quiz : {quiz.titre}</h1>
          <p className="teacher-subtitle">
            {quiz.cours_title || `Cours #${quiz.cours}`} • {questions.length} question
            {questions.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="teacher-list teacher-list--space">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="teacher-row teacher-row--card"
            style={{ display: "block" }}
          >
            <div className="teacher-row__title">
              Question {index + 1} : {question.enonce}
            </div>

            <div style={{ marginTop: 16 }}>
              {question.choix?.map((choice, choiceIndex) => {
                const isSelected = selectedAnswers[question.id] === choice.id;
                const questionResult = results[question.id];
                const isCorrectChoice = choice.est_correct;
                const isCorrectSelected =
                  hasSubmitted && isSelected && isCorrectChoice;
                const isWrongSelected =
                  hasSubmitted && isSelected && !isCorrectChoice;
                const showCorrectAnswer =
                  hasSubmitted && isCorrectChoice;

                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelectAnswer(question.id, choice.id)}
                    className="input"
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      marginBottom: 12,
                      cursor: hasSubmitted ? "default" : "pointer",
                      border: isCorrectSelected
                        ? "2px solid #16a34a"
                        : isWrongSelected
                        ? "2px solid #dc2626"
                        : showCorrectAnswer
                        ? "2px solid #16a34a"
                        : isSelected
                        ? "2px solid #1d4ed8"
                        : "",
                      backgroundColor: isCorrectSelected
                        ? "#dcfce7"
                        : isWrongSelected
                        ? "#fee2e2"
                        : showCorrectAnswer
                        ? "#f0fdf4"
                        : "",
                      fontWeight: isSelected || showCorrectAnswer ? "700" : "500",
                    }}
                  >
                    {choiceIndex + 1}. {choice.texte}
                  </button>
                );
              })}
            </div>

            {hasSubmitted && results[question.id] && (
              <div
                style={{
                  marginTop: 10,
                  fontWeight: 700,
                  color: results[question.id].isCorrect ? "#16a34a" : "#dc2626",
                }}
              >
                {results[question.id].isCorrect
                  ? "Bonne réponse ✅"
                  : "Mauvaise réponse ❌"}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="teacher-form-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate("/student/quiz")}
        >
          Retour
        </button>

        <button
          type="button"
          className="btn btn--primary"
          onClick={handleValidate}
          disabled={hasSubmitted}
        >
          {hasSubmitted ? "Réponse validée" : "Valider la réponse"}
        </button>
      </div>
    </section>
  );
}