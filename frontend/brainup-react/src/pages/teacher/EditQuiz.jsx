import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  FileQuestion,
  Layers3,
  Clock3,
  Eye,
  FileText,
  CheckCircle2,
  Save,
  ArrowLeft,
  ListChecks,
  Award,
  PencilLine,
} from "lucide-react";
import "../../styles/teacher/edit-quiz.css";

function mapLevelFromBackend(level) {
  if (level === "debutant") return "Débutant";
  if (level === "intermediaire") return "Intermédiaire";
  if (level === "avance") return "Avancé";
  return "Débutant";
}

function mapLevelToBackend(level) {
  if (level === "Débutant") return "debutant";
  if (level === "Intermédiaire") return "intermediaire";
  if (level === "Avancé") return "avance";
  return "debutant";
}

function mapStatusFromBackend(status) {
  if (status === "brouillon") return "Brouillon";
  if (status === "publie") return "Publié";
  return "Brouillon";
}

function mapStatusToBackend(status) {
  if (status === "Brouillon") return "brouillon";
  if (status === "Publié") return "publie";
  return "brouillon";
}

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    title: "",
    level: "Débutant",
    duration: 10,
    status: "Brouillon",
    description: "",
  });

  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchQuizData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const quizResponse = await fetch(`http://127.0.0.1:8001/api/quiz/${id}/`);
        if (!quizResponse.ok) {
          throw new Error("Impossible de charger le quiz.");
        }

        const quizData = await quizResponse.json();

        setQuiz({
          title: quizData.titre || "",
          level: mapLevelFromBackend(quizData.niveau),
          duration: quizData.temps_limite_minutes || 10,
          status: mapStatusFromBackend(quizData.statut),
          description: quizData.description || "",
        });

        const questionsResponse = await fetch(
          `http://127.0.0.1:8001/api/questions/?quiz=${id}`
        );
        if (!questionsResponse.ok) {
          throw new Error("Impossible de charger les questions.");
        }

        const questionsData = await questionsResponse.json();

        const formattedQuestions = await Promise.all(
          questionsData.map(async (question) => {
            const choicesResponse = await fetch(
              `http://127.0.0.1:8001/api/choix/?question=${question.id}`
            );

            const choices = choicesResponse.ok ? await choicesResponse.json() : [];

            let correctIndex = 0;
            const options = ["", "", "", ""];

            choices.forEach((choice, index) => {
              options[index] = choice.texte || "";
              if (choice.est_correct) {
                correctIndex = index;
              }
            });

            return {
              id: question.id,
              statement: question.enonce || "",
              options,
              correctIndex,
              points: question.points || 1,
            };
          })
        );

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Erreur chargement édition quiz :", error);
        setErrorMessage("Erreur lors du chargement du quiz.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuizData();
  }, [id]);

  function handleQuizChange(event) {
    const { name, value } = event.target;
    setQuiz((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleQuestionChange(questionId, field, value) {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      )
    );
  }

  function handleOptionChange(questionId, optionIndex, value) {
    setQuestions((previous) =>
      previous.map((question) => {
        if (question.id !== questionId) return question;

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      })
    );
  }

  function validateForm() {
    if (!quiz.title.trim()) {
      return "Le titre du quiz est obligatoire.";
    }

    if (!quiz.duration || Number(quiz.duration) < 1) {
      return "La durée doit être supérieure à 0.";
    }

    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];

      if (!question.statement.trim()) {
        return `L'énoncé de la question ${i + 1} est obligatoire.`;
      }

      if (!question.points || Number(question.points) < 1) {
        return `Les points de la question ${i + 1} doivent être supérieurs à 0.`;
      }

      for (let j = 0; j < question.options.length; j += 1) {
        if (!question.options[j].trim()) {
          return `L'option ${j + 1} de la question ${i + 1} est obligatoire.`;
        }
      }
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setSaveSuccess(false);
      return;
    }

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setErrorMessage("");

      const quizPayload = {
        titre: quiz.title.trim(),
        description: quiz.description.trim(),
        niveau: mapLevelToBackend(quiz.level),
        temps_limite_minutes: Number(quiz.duration),
        statut: mapStatusToBackend(quiz.status),
      };

      const quizResponse = await fetch(`http://127.0.0.1:8001/api/quiz/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizPayload),
      });

      const quizData = await quizResponse.json();

      if (!quizResponse.ok) {
        throw new Error(
          quizData?.detail || JSON.stringify(quizData) || "Erreur mise à jour quiz"
        );
      }

      for (let i = 0; i < questions.length; i += 1) {
        const question = questions[i];

        const questionPayload = {
          enonce: question.statement.trim(),
          type_question: "choix_unique",
          points: Number(question.points),
          ordre: i + 1,
          explication: "",
        };

        const questionResponse = await fetch(
          `http://127.0.0.1:8001/api/questions/${question.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(questionPayload),
          }
        );

        const questionData = await questionResponse.json();

        if (!questionResponse.ok) {
          throw new Error(
            questionData?.detail ||
              JSON.stringify(questionData) ||
              "Erreur mise à jour question"
          );
        }

        const choicesResponse = await fetch(
          `http://127.0.0.1:8001/api/choix/?question=${question.id}`
        );
        const choicesData = choicesResponse.ok ? await choicesResponse.json() : [];

        for (let j = 0; j < choicesData.length; j += 1) {
          const choice = choicesData[j];

          const choicePayload = {
            question: question.id,
            texte: question.options[j].trim(),
            est_correct: j === Number(question.correctIndex),
            ordre: j + 1,
          };

          const choiceResponse = await fetch(
            `http://127.0.0.1:8001/api/choix/${choice.id}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(choicePayload),
            }
          );

          const choiceData = await choiceResponse.json();

          if (!choiceResponse.ok) {
            throw new Error(
              choiceData?.detail ||
                JSON.stringify(choiceData) ||
                "Erreur mise à jour option"
            );
          }
        }
      }

      setSaveSuccess(true);
    } catch (error) {
      console.error("Erreur mise à jour quiz :", error);
      setErrorMessage(String(error.message || error));
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="edit-quiz-page">
        <div className="edit-quiz-loading">Chargement du quiz...</div>
      </section>
    );
  }

  return (
    <section className="edit-quiz-page">
      <div className="edit-quiz-hero">
        <div>
          <div className="edit-quiz-eyebrow">
            <Sparkles size={14} />
            <span>Modification avancée</span>
          </div>

          <h1 className="edit-quiz-title">Modifier le quiz</h1>
          <p className="edit-quiz-subtitle">
            Mettez à jour les informations, les questions et les bonnes réponses
            de manière propre et structurée.
          </p>
        </div>

        <div className="edit-quiz-summary">
          <div className="edit-quiz-summary__item">
            <span className="edit-quiz-summary__label">Questions</span>
            <strong>{questions.length}</strong>
          </div>

          <div className="edit-quiz-summary__item">
            <span className="edit-quiz-summary__label">Durée</span>
            <strong>{quiz.duration} min</strong>
          </div>

          <div className="edit-quiz-summary__item">
            <span className="edit-quiz-summary__label">Statut</span>
            <strong>{quiz.status}</strong>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="edit-quiz-feedback edit-quiz-feedback--error">
          {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div className="edit-quiz-feedback edit-quiz-feedback--success">
          Quiz mis à jour avec succès.
        </div>
      )}

      <form className="edit-quiz-layout" onSubmit={handleSubmit}>
        <section className="edit-quiz-card">
          <div className="edit-quiz-card__head">
            <PencilLine size={18} />
            <div>
              <h2>Informations générales</h2>
              <p className="edit-quiz-card__sub">
                Modifiez les paramètres principaux du quiz.
              </p>
            </div>
          </div>

          <div className="edit-quiz-grid">
            <div className="edit-quiz-field">
              <label className="edit-quiz-label">
                <FileQuestion size={16} />
                <span>Titre du quiz</span>
              </label>
              <input
                className="edit-quiz-input"
                name="title"
                value={quiz.title}
                onChange={handleQuizChange}
                placeholder="Ex. Quiz React - Hooks"
              />
            </div>

            <div className="edit-quiz-field">
              <label className="edit-quiz-label">
                <Layers3 size={16} />
                <span>Niveau</span>
              </label>
              <select
                className="edit-quiz-input"
                name="level"
                value={quiz.level}
                onChange={handleQuizChange}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </div>

            <div className="edit-quiz-field">
              <label className="edit-quiz-label">
                <Clock3 size={16} />
                <span>Durée (minutes)</span>
              </label>
              <input
                className="edit-quiz-input"
                type="number"
                min="1"
                name="duration"
                value={quiz.duration}
                onChange={handleQuizChange}
              />
            </div>

            <div className="edit-quiz-field">
              <label className="edit-quiz-label">
                <Eye size={16} />
                <span>Statut</span>
              </label>
              <select
                className="edit-quiz-input"
                name="status"
                value={quiz.status}
                onChange={handleQuizChange}
              >
                <option>Brouillon</option>
                <option>Publié</option>
              </select>
            </div>

            <div className="edit-quiz-field edit-quiz-field--full">
              <label className="edit-quiz-label">
                <FileText size={16} />
                <span>Description</span>
              </label>
              <textarea
                className="edit-quiz-textarea"
                name="description"
                value={quiz.description}
                onChange={handleQuizChange}
                placeholder="Décrivez brièvement le quiz..."
              />
            </div>
          </div>
        </section>

        <section className="edit-quiz-card">
          <div className="edit-quiz-card__head">
            <ListChecks size={18} />
            <div>
              <h2>Questions du quiz</h2>
              <p className="edit-quiz-card__sub">
                Modifiez les énoncés, les options et les bonnes réponses.
              </p>
            </div>
          </div>

          <div className="edit-quiz-questions">
            {questions.map((question, index) => (
              <article key={question.id} className="edit-question-card">
                <div className="edit-question-card__top">
                  <div className="edit-question-card__titlewrap">
                    <div className="edit-question-card__badge">
                      <ListChecks size={16} />
                    </div>

                    <div>
                      <h3 className="edit-question-card__title">
                        Question {index + 1}
                      </h3>
                      <p className="edit-question-card__meta">
                        Ajustez le contenu et la correction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="edit-quiz-grid">
                  <div className="edit-quiz-field edit-quiz-field--full">
                    <label className="edit-quiz-label">
                      <FileQuestion size={16} />
                      <span>Énoncé</span>
                    </label>
                    <input
                      className="edit-quiz-input"
                      value={question.statement}
                      onChange={(event) =>
                        handleQuestionChange(
                          question.id,
                          "statement",
                          event.target.value
                        )
                      }
                      placeholder="Ex. Quel hook permet de gérer un état local ?"
                    />
                  </div>

                  {question.options.map((option, optionIndex) => (
                    <div className="edit-quiz-field" key={optionIndex}>
                      <label className="edit-quiz-label">
                        <CheckCircle2 size={16} />
                        <span>Option {optionIndex + 1}</span>
                      </label>
                      <input
                        className="edit-quiz-input"
                        value={option}
                        onChange={(event) =>
                          handleOptionChange(
                            question.id,
                            optionIndex,
                            event.target.value
                          )
                        }
                        placeholder={`Réponse ${optionIndex + 1}`}
                      />
                    </div>
                  ))}

                  <div className="edit-quiz-field">
                    <label className="edit-quiz-label">
                      <CheckCircle2 size={16} />
                      <span>Bonne réponse</span>
                    </label>
                    <select
                      className="edit-quiz-input"
                      value={question.correctIndex}
                      onChange={(event) =>
                        handleQuestionChange(
                          question.id,
                          "correctIndex",
                          Number(event.target.value)
                        )
                      }
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>

                  <div className="edit-quiz-field">
                    <label className="edit-quiz-label">
                      <Award size={16} />
                      <span>Points</span>
                    </label>
                    <input
                      className="edit-quiz-input"
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(event) =>
                        handleQuestionChange(
                          question.id,
                          "points",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="edit-quiz-actions">
          <button
            type="button"
            className="edit-quiz-btn edit-quiz-btn--ghost"
            onClick={() => navigate("/teacher/quiz")}
          >
            <ArrowLeft size={16} />
            <span>Annuler</span>
          </button>

          <button
            type="submit"
            className={`edit-quiz-btn ${
              saveSuccess
                ? "edit-quiz-btn--success"
                : "edit-quiz-btn--primary"
            }`}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>
              {isSaving
                ? "Mise à jour..."
                : saveSuccess
                ? "Quiz mis à jour"
                : "Mettre à jour le quiz"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}