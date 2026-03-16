import { useEffect, useState } from "react";

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

export default function CreateQuiz() {
  const [quiz, setQuiz] = useState(createInitialQuiz());
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [courses, setCourses] = useState([]);

  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // À adapter plus tard avec l'utilisateur connecté
  const teacherId = 37;

  useEffect(() => {
    console.log("CREATE QUIZ COMPONENT CHARGE");

    async function fetchCourses() {
      try {
        setIsLoadingCourses(true);
        setErrorMessage("");

        const response = await fetch(
          `http://127.0.0.1:8001/api/courses/?enseignant=${teacherId}`
        );

        console.log("GET /api/courses/ status =", response.status);

        if (!response.ok) {
          throw new Error("Impossible de charger les cours.");
        }

        const data = await response.json();
        console.log("COURSES DATA =", data);

        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur chargement cours :", error);
        setCourses([]);
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

  function validateForm() {
    if (!quiz.title.trim()) {
      return "Le titre du quiz est obligatoire.";
    }

    if (!quiz.courseId) {
      return "Veuillez sélectionner un cours.";
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
    console.log("SUBMIT CLICK OK");

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
        cours: Number(quiz.courseId),
        enseignant: teacherId,
        niveau: mapLevelToBackend(quiz.level),
        temps_limite_minutes: Number(quiz.duration),
        tentatives_autorisees: 1,
        score_reussite: 10,
        statut: mapStatusToBackend(quiz.status),
        melanger_questions: false,
        afficher_feedback: true,
      };

      console.log("QUIZ PAYLOAD =", quizPayload);

      const quizResponse = await fetch("http://127.0.0.1:8001/api/quiz/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizPayload),
      });

      console.log("POST /api/quiz/ status =", quizResponse.status);

      const quizData = await quizResponse.json();
      console.log("QUIZ RESPONSE =", quizData);

      if (!quizResponse.ok) {
        throw new Error(
          quizData?.detail || JSON.stringify(quizData) || "Erreur création quiz"
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

        console.log("QUESTION PAYLOAD =", questionPayload);

        const questionResponse = await fetch(
          "http://127.0.0.1:8001/api/questions/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(questionPayload),
          }
        );

        console.log("POST /api/questions/ status =", questionResponse.status);

        const questionData = await questionResponse.json();
        console.log("QUESTION RESPONSE =", questionData);

        if (!questionResponse.ok) {
          throw new Error(
            questionData?.detail ||
              JSON.stringify(questionData) ||
              "Erreur création question"
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

          console.log("CHOIX PAYLOAD =", optionPayload);

          const optionResponse = await fetch(
            "http://127.0.0.1:8001/api/choix/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(optionPayload),
            }
          );

          console.log("POST /api/choix/ status =", optionResponse.status);

          const optionData = await optionResponse.json();
          console.log("CHOIX RESPONSE =", optionData);

          if (!optionResponse.ok) {
            throw new Error(
              optionData?.detail ||
                JSON.stringify(optionData) ||
                "Erreur création option"
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
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Créer un quiz</h1>
          <p className="teacher-subtitle">
            Ajoutez un quiz, ses questions et les bonnes réponses.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: "16px", color: "#c0392b", fontWeight: 600 }}>
          {errorMessage}
        </div>
      )}

      {saveSuccess && (
        <div style={{ marginBottom: "16px", color: "#1e8449", fontWeight: 600 }}>
          Quiz enregistré avec succès.
        </div>
      )}

      <form className="teacher-form-card" onSubmit={handleSubmit}>
        <div className="teacher-form-grid">
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
                {isLoadingCourses ? "Chargement des cours..." : "Sélectionner un cours"}
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

          <div className="field teacher-field--full">
            <label className="label">Description</label>
            <textarea
              className="teacher-textarea"
              name="description"
              value={quiz.description}
              onChange={handleQuizChange}
              placeholder="Décrivez brièvement le quiz..."
            />
          </div>
        </div>

        <div className="teacher-builder-head">
          <h2 className="card__title">Questions du quiz</h2>
          <button
            type="button"
            className="btn btn--soft"
            onClick={addQuestion}
          >
            + Ajouter une question
          </button>
        </div>

        <div className="teacher-questions">
          {questions.map((question, index) => (
            <div key={question.id} className="teacher-question-card">
              <div className="teacher-question-card__head">
                <h3 className="teacher-question-card__title">
                  Question {index + 1}
                </h3>

                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => removeQuestion(question.id)}
                  disabled={questions.length === 1}
                >
                  Supprimer
                </button>
              </div>

              <div className="teacher-form-grid">
                <div className="field teacher-field--full">
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

                {question.options.map((option, optionIndex) => (
                  <div className="field" key={optionIndex}>
                    <label className="label">Option {optionIndex + 1}</label>
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
                  </div>
                ))}

                <div className="field">
                  <label className="label">Bonne réponse</label>
                  <select
                    className="input"
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
            </div>
          ))}
        </div>

        <div className="teacher-form-actions">
          <button type="button" className="btn btn--ghost" onClick={resetForm}>
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSaving}
            style={
              saveSuccess
                ? { backgroundColor: "#1e8449", borderColor: "#1e8449" }
                : {}
            }
          >
            {isSaving
              ? "Enregistrement..."
              : saveSuccess
              ? "Quiz enregistré"
              : "Enregistrer le quiz"}
          </button>
        </div>
      </form>
    </section>
  );
}