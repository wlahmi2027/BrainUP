import { useEffect, useMemo, useRef, useState } from "react";

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

  const lastQuestionRef = useRef(null);

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

  const totalPoints = useMemo(() => {
    return questions.reduce((sum, q) => sum + Number(q.points || 0), 0);
  }, [questions]);

  const validQuestionsCount = useMemo(() => {
    return questions.filter((q) => {
      const statementOk = q.statement.trim() !== "";
      const optionsOk = q.options.every((opt) => opt.trim() !== "");
      const pointsOk = Number(q.points) > 0;
      return statementOk && optionsOk && pointsOk;
    }).length;
  }, [questions]);

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
    const newQuestion = createEmptyQuestion();
    setQuestions((previous) => [...previous, newQuestion]);

    setTimeout(() => {
      lastQuestionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function duplicateQuestion(questionId) {
    const source = questions.find((q) => q.id === questionId);
    if (!source) return;

    const duplicated = {
      ...source,
      id: Date.now() + Math.random(),
      options: [...source.options],
    };

    setQuestions((previous) => [...previous, duplicated]);
  }

  function removeQuestion(questionId) {
    if (questions.length === 1) return;

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette question ?"
    );
    if (!confirmed) return;

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

    if (quiz.status === "Publié" && validQuestionsCount === 0) {
      return "Impossible de publier un quiz vide.";
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
      const userId = localStorage.getItem("user_id");

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
    <section className="page teacher-page create-quiz-page">
      <div className="create-quiz-hero">
        <div>
          <h1 className="create-quiz-title">Créer un quiz</h1>
          <p className="create-quiz-subtitle">
            Concevez un quiz structuré, ajoutez vos questions et préparez une
            évaluation claire pour vos étudiants.
          </p>
        </div>

        <div className="create-quiz-summary">
          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Questions</span>
            <strong>{questions.length}</strong>
          </div>
          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Valides</span>
            <strong>{validQuestionsCount}</strong>
          </div>
          <div className="create-quiz-summary__item">
            <span className="create-quiz-summary__label">Points total</span>
            <strong>{totalPoints}</strong>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="quiz-feedback quiz-feedback--error">{errorMessage}</div>
      )}

      {saveSuccess && (
        <div className="quiz-feedback quiz-feedback--success">
          Quiz enregistré avec succès.
        </div>
      )}

      {courses.length === 0 && !isLoadingCourses && (
        <div className="quiz-empty-state">
          <h3>Aucun cours publié disponible</h3>
          <p>
            Vous devez publier au moins un cours avant de pouvoir l’associer à
            un quiz.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-quiz-layout">
        <section className="create-quiz-card">
          <div className="create-quiz-card__head">
            <h2>Informations générales</h2>
            <span className="create-quiz-card__pill">Quiz principal</span>
          </div>

          <div className="create-quiz-grid">
            <div className="field">
              <label className="label">Titre du quiz</label>
              <input
                className="input"
                name="title"
                value={quiz.title}
                onChange={handleQuizChange}
                placeholder="Ex. Quiz React - Hooks"
              />
            </div>

            <div className="field">
              <label className="label">Cours associé</label>
              <select
                className="input"
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

            <div className="field">
              <label className="label">Niveau</label>
              <select
                className="input"
                name="level"
                value={quiz.level}
                onChange={handleQuizChange}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </div>

            <div className="field">
              <label className="label">Durée (minutes)</label>
              <input
                className="input"
                type="number"
                min="1"
                name="duration"
                value={quiz.duration}
                onChange={handleQuizChange}
              />
            </div>

            <div className="field">
              <label className="label">Statut</label>
              <select
                className="input"
                name="status"
                value={quiz.status}
                onChange={handleQuizChange}
              >
                <option>Brouillon</option>
                <option>Publié</option>
              </select>
            </div>

            <div className="field create-quiz-field--full">
              <label className="label">Description</label>
              <textarea
                className="teacher-textarea create-quiz-textarea"
                name="description"
                value={quiz.description}
                onChange={handleQuizChange}
                placeholder="Décrivez brièvement le quiz, son objectif et les notions évaluées..."
              />
            </div>
          </div>
        </section>

        <section className="create-quiz-card">
          <div className="create-quiz-card__head create-quiz-card__head--between">
            <div>
              <h2>Questions du quiz</h2>
              <p className="create-quiz-card__sub">
                Ajoutez les questions, les réponses possibles et choisissez la
                bonne réponse.
              </p>
            </div>

            <button
              type="button"
              className="btn btn--soft"
              onClick={addQuestion}
            >
              + Ajouter une question
            </button>
          </div>

          <div className="create-quiz-questions">
            {questions.map((question, index) => {
              const isLast = index === questions.length - 1;

              return (
                <article
                  key={question.id}
                  ref={isLast ? lastQuestionRef : null}
                  className="question-builder-card"
                >
                  <div className="question-builder-card__top">
                    <div className="question-builder-card__titlewrap">
                      <div className="question-builder-card__badge">
                        Q{index + 1}
                      </div>
                      <div>
                        <h3 className="question-builder-card__title">
                          Question {index + 1}
                        </h3>
                        <p className="question-builder-card__meta">
                          {Number(question.points || 0)} point
                          {Number(question.points || 0) > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="question-builder-card__actions">
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => duplicateQuestion(question.id)}
                      >
                        Dupliquer
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => removeQuestion(question.id)}
                        disabled={questions.length === 1}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="create-quiz-grid">
                    <div className="field create-quiz-field--full">
                      <label className="label">Énoncé</label>
                      <input
                        className="input"
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

                    <div className="create-quiz-field--full">
                      <label className="label">Réponses</label>
                      <div className="question-options-grid">
                        {question.options.map((option, optionIndex) => {
                          const isCorrect =
                            Number(question.correctIndex) === optionIndex;

                          return (
                            <div
                              key={optionIndex}
                              className={`question-option-card ${
                                isCorrect ? "is-correct" : ""
                              }`}
                            >
                              <div className="question-option-card__top">
                                <span className="question-option-card__index">
                                  Option {optionIndex + 1}
                                </span>
                                {isCorrect && (
                                  <span className="question-option-card__correct">
                                    Bonne réponse
                                  </span>
                                )}
                              </div>

                              <input
                                className="input"
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

                              <button
                                type="button"
                                className={`question-option-card__select ${
                                  isCorrect ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleQuestionChange(
                                    question.id,
                                    "correctIndex",
                                    optionIndex
                                  )
                                }
                              >
                                {isCorrect
                                  ? "Réponse correcte sélectionnée"
                                  : "Choisir comme bonne réponse"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Points</label>
                      <input
                        className="input"
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
              );
            })}
          </div>
        </section>

        <div className="create-quiz-stickybar">
          <div className="create-quiz-stickybar__left">
            <div className="create-quiz-stickybar__kpi">
              <span>Questions :</span>
              <strong>{questions.length}</strong>
            </div>
            <div className="create-quiz-stickybar__kpi">
              <span>Points total :</span>
              <strong>{totalPoints}</strong>
            </div>
          </div>

          <div className="create-quiz-stickybar__right">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={resetForm}
            >
              Réinitialiser
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer le quiz"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}