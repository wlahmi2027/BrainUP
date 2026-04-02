import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
    console.log("UPDATE QUIZ CLICK OK");

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

      console.log("PATCH QUIZ PAYLOAD =", quizPayload);

      const quizResponse = await fetch(`http://127.0.0.1:8001/api/quiz/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quizPayload),
      });

      const quizData = await quizResponse.json();
      console.log("PATCH QUIZ RESPONSE =", quizData);

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
        console.log("PATCH QUESTION RESPONSE =", questionData);

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
          console.log("PATCH CHOICE RESPONSE =", choiceData);

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
      <section className="page teacher-page">
        <p>Chargement du quiz...</p>
      </section>
    );
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Modifier le quiz</h1>
          <p className="teacher-subtitle">
            Mettez à jour le quiz, ses questions et les bonnes réponses.
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
          Quiz mis à jour avec succès.
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
        </div>

        <div className="teacher-questions">
          {questions.map((question, index) => (
            <div key={question.id} className="teacher-question-card">
              <div className="teacher-question-card__head">
                <h3 className="teacher-question-card__title">
                  Question {index + 1}
                </h3>
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
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/teacher/quiz")}
          >
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
              ? "Mise à jour..."
              : saveSuccess
              ? "Quiz mis à jour"
              : "Mettre à jour le quiz"}
          </button>
        </div>
      </form>
    </section>
  );
}