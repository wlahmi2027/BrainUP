import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { submitStudentQuiz } from "../../api/quizzes";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileQuestion,
  Trophy,
  AlertCircle,
} from "lucide-react";
import "../../styles/student/quiz.css";

export default function StudentQuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  async function handleValidate() {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const newResults = {};
      const answersPayload = questions.map((question) => {
        const selectedChoiceId = selectedAnswers[question.id];
        const selectedChoice = question.choix?.find(
          (choice) => choice.id === selectedChoiceId
        );

        newResults[question.id] = {
          isCorrect: Boolean(selectedChoice?.est_correct),
          correctChoiceId:
            question.choix?.find((choice) => choice.est_correct)?.id || null,
        };

        return {
          question_id: question.id,
          choice_id: selectedChoiceId || null,
        };
      });

      setResults(newResults);
      setHasSubmitted(true);

      const response = await submitStudentQuiz(id, {
        answers: answersPayload,
        time_spent_seconds: 0,
      });

      setSubmissionResult(response);
    } catch (error) {
      console.error("Erreur soumission quiz :", error);
      setErrorMessage("Impossible d'enregistrer votre score.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }

  function goPrev() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionNumber = currentQuestionIndex + 1;
  const totalQuestions = questions.length;

  const progressPercent = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((currentQuestionNumber / totalQuestions) * 100);
  }, [currentQuestionNumber, totalQuestions]);

  const answeredCount = useMemo(() => {
    return Object.values(selectedAnswers).filter(Boolean).length;
  }, [selectedAnswers]);

  const currentAnswered = currentQuestion
    ? Boolean(selectedAnswers[currentQuestion.id])
    : false;

  const allAnswered = useMemo(() => {
    return questions.length > 0 && questions.every((q) => selectedAnswers[q.id]);
  }, [questions, selectedAnswers]);

  if (isLoading) {
    return (
      <section className="student-quiz-detail-page">
        <div className="student-quiz-empty">Chargement du quiz...</div>
      </section>
    );
  }

  if (errorMessage && !quiz) {
    return (
      <section className="student-quiz-detail-page">
        <div className="student-quiz-empty student-quiz-empty--error">
          {errorMessage}
        </div>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="student-quiz-detail-page">
        <div className="student-quiz-empty">Quiz introuvable.</div>
      </section>
    );
  }

  return (
    <section className="student-quiz-detail-page">
      <div className="student-quiz-detail-head">
        <div>
          <button
            type="button"
            className="student-quiz-back"
            onClick={() => navigate("/student/quiz")}
          >
            <ArrowLeft size={16} />
            <span>Retour aux quiz</span>
          </button>

          <span className="student-quiz-eyebrow">Quiz étudiant</span>
          <h1 className="student-quiz-title">{quiz.titre}</h1>
          <p className="student-quiz-subtitle">
            {quiz.cours_title || `Cours #${quiz.cours}`} • {questions.length} question
            {questions.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="student-quiz-summary-card">
          <div className="student-quiz-summary-card__item">
            <FileQuestion size={16} />
            <span>
              {answeredCount}/{questions.length} répondues
            </span>
          </div>

          <div className="student-quiz-summary-card__item">
            <Clock3 size={16} />
            <span>
              {quiz.temps_limite_minutes
                ? `${quiz.temps_limite_minutes} min`
                : "Temps libre"}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && quiz && (
        <div className="student-quiz-alert student-quiz-alert--error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {submissionResult && (
        <div className="student-quiz-alert student-quiz-alert--success">
          <Trophy size={18} />
          <span>
            Score enregistré : {submissionResult.score}/{submissionResult.score_max} (
            {submissionResult.pourcentage}%)
          </span>
        </div>
      )}

      <div className="student-quiz-progress">
        <div className="student-quiz-progress__top">
          <span>
            Question {currentQuestionNumber} sur {totalQuestions}
          </span>
          <span>{progressPercent}%</span>
        </div>

        <div className="student-quiz-progress__bar">
          <div
            className="student-quiz-progress__fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <article className="student-question-card student-question-card--single">
          <div className="student-question-card__head student-question-card__head--clean">
            <div className="student-question-card__number">
              {currentQuestionNumber}
            </div>

            <div className="student-question-card__head-text">
              <h2>Question {currentQuestionNumber}</h2>
              <p>{currentQuestion.enonce}</p>
            </div>
          </div>

          <div className="student-question-card__choices student-question-card__choices--clean">
            {currentQuestion.choix?.map((choice, choiceIndex) => {
              const isSelected = selectedAnswers[currentQuestion.id] === choice.id;
              const isCorrectChoice = choice.est_correct;
              const questionResult = results[currentQuestion.id];
              const isCorrectSelected =
                hasSubmitted && isSelected && isCorrectChoice;
              const isWrongSelected =
                hasSubmitted && isSelected && !isCorrectChoice;
              const showCorrectAnswer = hasSubmitted && isCorrectChoice;

              let choiceClass = "student-choice-card student-choice-card--clean";
              if (isSelected) choiceClass += " is-selected";
              if (isCorrectSelected) choiceClass += " is-correct";
              if (isWrongSelected) choiceClass += " is-wrong";
              if (showCorrectAnswer && !isSelected) choiceClass += " is-correct-soft";

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() =>
                    handleSelectAnswer(currentQuestion.id, choice.id)
                  }
                  className={choiceClass}
                  disabled={hasSubmitted}
                >
                  <div className="student-choice-card__left">
                    <div className="student-choice-card__marker">
                      {isCorrectSelected || showCorrectAnswer ? (
                        <CheckCircle2 size={18} />
                      ) : isWrongSelected ? (
                        <AlertCircle size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </div>

                    <div className="student-choice-card__content">
                      <span className="student-choice-card__index">
                        Réponse {choiceIndex + 1}
                      </span>
                      <strong>{choice.texte}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {hasSubmitted && results[currentQuestion.id] && (
            <div
              className={`student-question-card__feedback ${
                results[currentQuestion.id].isCorrect ? "is-correct" : "is-wrong"
              }`}
            >
              {results[currentQuestion.id].isCorrect
                ? "Bonne réponse "
                : "Mauvaise réponse "}
            </div>
          )}
        </article>
      )}

      <div className="student-quiz-step-actions">
        <button
          type="button"
          className="student-quiz-btn student-quiz-btn--ghost"
          onClick={goPrev}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft size={16} />
          <span>Précédent</span>
        </button>

        {!hasSubmitted && currentQuestionIndex < totalQuestions - 1 && (
          <button
            type="button"
            className="student-quiz-btn student-quiz-btn--primary"
            onClick={goNext}
            disabled={!currentAnswered}
          >
            <span>Suivant</span>
            <ArrowRight size={16} />
          </button>
        )}

        {!hasSubmitted && currentQuestionIndex === totalQuestions - 1 && (
          <button
            type="button"
            className="student-quiz-btn student-quiz-btn--primary"
            onClick={handleValidate}
            disabled={isSubmitting || !allAnswered}
          >
            {isSubmitting ? "Enregistrement..." : "Valider le quiz"}
          </button>
        )}

        {hasSubmitted && currentQuestionIndex < totalQuestions - 1 && (
          <button
            type="button"
            className="student-quiz-btn student-quiz-btn--primary"
            onClick={goNext}
          >
            <span>Question suivante</span>
            <ArrowRight size={16} />
          </button>
        )}

        {hasSubmitted && currentQuestionIndex === totalQuestions - 1 && (
          <button
            type="button"
            className="student-quiz-btn student-quiz-btn--primary"
            onClick={() => navigate("/student/quiz")}
          >
            Retour à la liste
          </button>
        )}
      </div>
    </section>
  );
}