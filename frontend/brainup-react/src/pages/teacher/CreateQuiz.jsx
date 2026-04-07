import { useEffect, useState } from "react";
import {
  Sparkles,
  FileQuestion,
  BookOpen,
  Layers3,
  Clock3,
  Eye,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  RotateCcw,
  ListChecks,
  Award,
} from "lucide-react";
import "../../styles/teacher/create-quiz.css";

function createEmptyQuestion() {
  return {
    id: Date.now() + Math.random(),
    statement: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    points: 1,
  };
}

function createInitialQuiz() {
  return {
    title: "",
    courseId: "",
    level: "Débutant",
    duration: 10,
    status: "Brouillon",
    description: "",
  };
}

function mapLevelToBackend(level) {
  if (level === "Débutant") return "debutant";
  if (level === "Intermédiaire") return "intermediaire";
  if (level === "Avancé") return "avance";
  return "debutant";
}

function mapStatusToBackend(status) {
  if (status === "Brouillon") return "brouillon";
  if (status === "Publié") return "publie";
  return "brouillon";
}

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState(createInitialQuiz());
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [courses, setCourses] = useState([]);

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoadingCourses(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Utilisateur non connecté.");
        }

        const response = await fetch(
          "http://127.0.0.1:8001/api/courses/?mine=true",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Impossible de charger les cours.");
        }

        const data = await response.json();

        const publishedCourses = Array.isArray(data)
          ? data.filter(
              (course) =>
                course.status === "publie" || course.is_published === true
            )
          : [];

        setCourses(publishedCourses);
      } catch (error) {
        console.error("Erreur chargement cours :", error);
        setCourses([]);
        setErrorMessage(error.message || "Erreur lors du chargement des cours.");
      } finally {
        setIsLoadingCourses(false);
      }
    }

    fetchCourses();
  }, []);

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

  function addQuestion() {
    setQuestions((previous) => [...previous, createEmptyQuestion()]);
  }

  function removeQuestion(questionId) {
    if (questions.length === 1) return;

    setQuestions((previous) =>
      previous.filter((question) => question.id !== questionId)
    );
  }

  function resetForm() {
    setQuiz(createInitialQuiz());
    setQuestions([createEmptyQuestion()]);
    setSaveSuccess(false);
    setErrorMessage("");
  }

  function validateForm() {
    if (!quiz.title.trim()) {
      return "Le titre du quiz est obligatoire.";
    }

    if (!quiz.courseId) {
      return "Veuillez sélectionner un cours publié.";
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

      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");
      const userId =
        localStorage.getItem("user_id") ||
        (userRaw ? JSON.parse(userRaw)?.id : null);

      if (!token || !userId) {
        throw new Error("Session invalide. Veuillez vous reconnecter.");
      }

      const quizPayload = {
        titre: quiz.title.trim(),
        description: quiz.description.trim(),
        cours: Number(quiz.courseId),
        enseignant: Number(userId),
        niveau: mapLevelToBackend(quiz.level),
        temps_limite_minutes: Number(quiz.duration),
        tentatives_autorisees: 1,
        score_reussite: 10,
        statut: mapStatusToBackend(quiz.status),
        melanger_questions: false,
        afficher_feedback: true,
      };

      const quizResponse = await fetch("http://127.0.0.1:8001/api/quiz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizPayload),
      });

      const quizData = await quizResponse.json();

      if (!quizResponse.ok) {
        throw new Error(
          quizData?.detail ||
            quizData?.message ||
            JSON.stringify(quizData) ||
            "Erreur lors de la création du quiz."
        );
      }

      const createdQuiz = quizData;

      for (let i = 0; i < questions.length; i += 1) {
        const question = questions[i];

        const questionPayload = {
          quiz: createdQuiz.id,
          enonce: question.statement.trim(),
          type_question: "choix_unique",
          points: Number(question.points),
          ordre: i + 1,
          explication: "",
        };

        const questionResponse = await fetch(
          "http://127.0.0.1:8001/api/questions/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(questionPayload),
          }
        );

        const questionData = await questionResponse.json();

        if (!questionResponse.ok) {
          throw new Error(
            questionData?.detail ||
              questionData?.message ||
              JSON.stringify(questionData) ||
              "Erreur lors de la création d'une question."
          );
        }

        const createdQuestion = questionData;

        for (let j = 0; j < question.options.length; j += 1) {
          const optionPayload = {
            question: createdQuestion.id,
            texte: question.options[j].trim(),
            est_correct: j === Number(question.correctIndex),
            ordre: j + 1,
          };

          const optionResponse = await fetch(
            "http://127.0.0.1:8001/api/choix/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(optionPayload),
            }
          );

          const optionData = await optionResponse.json();

          if (!optionResponse.ok) {
            throw new Error(
              optionData?.detail ||
                optionData?.message ||
                JSON.stringify(optionData) ||
                "Erreur lors de la création d'une option."
            );
          }
        }
      }

      setSaveSuccess(true);
    } catch (error) {
      console.error("Erreur enregistrement quiz :", error);
      setErrorMessage(String(error.message || error));
      setSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="create-quiz-page">
      <div className="create-quiz-hero">
        <div>
          <div className="create-quiz-eyebrow">
            <Sparkles size={14} />
            <span>Création intelligente</span>
          </div>

          <h1 className="create-quiz-title">Créer un quiz</h1>
          <p className="create-quiz-subtitle">
            Ajoutez un quiz, structurez ses questions et définissez clairement
            les bonnes réponses dans une interface moderne.
          </p>
        </div>

        <div className="create-quiz-summary">
          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Questions</span>
            <strong>{questions.length}</strong>
          </div>

          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Durée</span>
            <strong>{quiz.duration} min</strong>
          </div>

          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Statut</span>
            <strong>{quiz.status}</strong>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="quiz-feedback quiz-feedback--error">
          {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div className="quiz-feedback quiz-feedback--success">
          Quiz enregistré avec succès.
        </div>
      )}

      <form className="create-quiz-layout" onSubmit={handleSubmit}>
        <section className="create-quiz-card">
          <div className="create-quiz-card__head">
            <FileQuestion size={18} />
            <div>
              <h2>Informations générales</h2>
              <p className="create-quiz-card__sub">
                Renseignez les informations principales du quiz.
              </p>
            </div>
          </div>

          <div className="create-quiz-grid">
            <div className="create-quiz-field">
              <label className="create-quiz-label">
                <FileQuestion size={16} />
                <span>Titre du quiz</span>
              </label>
              <input
                className="create-quiz-input"
                name="title"
                value={quiz.title}
                onChange={handleQuizChange}
                placeholder="Ex. Quiz React - Hooks"
              />
            </div>

            <div className="create-quiz-field">
              <label className="create-quiz-label">
                <BookOpen size={16} />
                <span>Cours associé</span>
              </label>
              <select
                className="create-quiz-input"
                name="courseId"
                value={quiz.courseId}
                onChange={handleQuizChange}
                disabled={isLoadingCourses}
              >
                <option value="">
                  {isLoadingCourses
                    ? "Chargement des cours..."
                    : courses.length === 0
                    ? "Aucun cours publié disponible"
                    : "Sélectionner un cours"}
                </option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-quiz-field">
              <label className="create-quiz-label">
                <Layers3 size={16} />
                <span>Niveau</span>
              </label>
              <select
                className="create-quiz-input"
                name="level"
                value={quiz.level}
                onChange={handleQuizChange}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </div>

            <div className="create-quiz-field">
              <label className="create-quiz-label">
                <Clock3 size={16} />
                <span>Durée (minutes)</span>
              </label>
              <input
                className="create-quiz-input"
                type="number"
                min="1"
                name="duration"
                value={quiz.duration}
                onChange={handleQuizChange}
              />
            </div>

            <div className="create-quiz-field">
              <label className="create-quiz-label">
                <Eye size={16} />
                <span>Statut</span>
              </label>
              <select
                className="create-quiz-input"
                name="status"
                value={quiz.status}
                onChange={handleQuizChange}
              >
                <option>Brouillon</option>
                <option>Publié</option>
              </select>
            </div>

            <div className="create-quiz-field create-quiz-field--full">
              <label className="create-quiz-label">
                <FileText size={16} />
                <span>Description</span>
              </label>
              <textarea
                className="create-quiz-textarea"
                name="description"
                value={quiz.description}
                onChange={handleQuizChange}
                placeholder="Décrivez brièvement le quiz..."
              />
            </div>
          </div>
        </section>

        <section className="create-quiz-card">
          <div className="create-quiz-card__head create-quiz-card__head--between">
            <div>
              <h2>Questions du quiz</h2>
              <p className="create-quiz-card__sub">
                Ajoutez les questions et choisissez la bonne réponse.
              </p>
            </div>

            <button
              type="button"
              className="create-quiz-add-btn"
              onClick={addQuestion}
            >
              <Plus size={16} />
              <span>Ajouter une question</span>
            </button>
          </div>

          <div className="create-quiz-questions">
            {questions.map((question, index) => (
              <article key={question.id} className="question-builder-card">
                <div className="question-builder-card__top">
                  <div className="question-builder-card__titlewrap">
                    <div className="question-builder-card__badge">
                      <ListChecks size={16} />
                    </div>

                    <div>
                      <h3 className="question-builder-card__title">
                        Question {index + 1}
                      </h3>
                      <p className="question-builder-card__meta">
                        Définissez l’énoncé, les options et la bonne réponse.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="question-builder-card__delete"
                    onClick={() => removeQuestion(question.id)}
                    disabled={questions.length === 1}
                  >
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                </div>

                <div className="create-quiz-grid">
                  <div className="create-quiz-field create-quiz-field--full">
                    <label className="create-quiz-label">
                      <FileQuestion size={16} />
                      <span>Énoncé</span>
                    </label>
                    <input
                      className="create-quiz-input"
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
                    <div className="create-quiz-field" key={optionIndex}>
                      <label className="create-quiz-label">
                        <CheckCircle2 size={16} />
                        <span>Option {optionIndex + 1}</span>
                      </label>
                      <input
                        className="create-quiz-input"
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

                  <div className="create-quiz-field">
                    <label className="create-quiz-label">
                      <CheckCircle2 size={16} />
                      <span>Bonne réponse</span>
                    </label>
                    <select
                      className="create-quiz-input"
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

                  <div className="create-quiz-field">
                    <label className="create-quiz-label">
                      <Award size={16} />
                      <span>Points</span>
                    </label>
                    <input
                      className="create-quiz-input"
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

        <div className="create-quiz-actions">
          <button
            type="button"
            className="create-quiz-btn create-quiz-btn--ghost"
            onClick={resetForm}
          >
            <RotateCcw size={16} />
            <span>Réinitialiser</span>
          </button>

          <button
            type="submit"
            className={`create-quiz-btn ${
              saveSuccess
                ? "create-quiz-btn--success"
                : "create-quiz-btn--primary"
            }`}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>
              {isSaving
                ? "Enregistrement..."
                : saveSuccess
                ? "Quiz enregistré"
                : "Enregistrer le quiz"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}