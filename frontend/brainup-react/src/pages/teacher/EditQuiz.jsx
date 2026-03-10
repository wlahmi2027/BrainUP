import { useState } from "react";

function createQuestion(id, statement, options, correctIndex, points) {
  return {
    id,
    statement,
    options,
    correctIndex,
    points,
  };
}

export default function EditQuiz() {
  const [quiz, setQuiz] = useState({
    title: "Quiz React - Hooks",
    courseId: "2",
    level: "Intermédiaire",
    duration: 15,
    status: "Publié",
    description: "Quiz de vérification des connaissances sur les hooks React.",
  });

  const [questions, setQuestions] = useState([
    createQuestion(
      1,
      "Quel hook permet de gérer un état local ?",
      ["useRef", "useState", "useMemo", "useEffect"],
      1,
      1
    ),
    createQuestion(
      2,
      "Quel hook permet d’exécuter un effet secondaire ?",
      ["useState", "useEffect", "useContext", "useReducer"],
      1,
      1
    ),
  ]);

  const courses = [
    { id: 1, title: "Python avancé" },
    { id: 2, title: "React moderne" },
    { id: 3, title: "Bases de données" },
  ];

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
    const newQuestion = {
      id: Date.now(),
      statement: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      points: 1,
    };

    setQuestions((previous) => [...previous, newQuestion]);
  }

  function removeQuestion(questionId) {
    if (questions.length === 1) return;

    setQuestions((previous) =>
      previous.filter((question) => question.id !== questionId)
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...quiz,
      duration: Number(quiz.duration),
      questions: questions.map((question) => ({
        statement: question.statement,
        options: question.options,
        correctIndex: Number(question.correctIndex),
        points: Number(question.points),
      })),
    };

    console.log("Quiz modifié :", payload);
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Modifier un quiz</h1>
          <p className="teacher-subtitle">
            Mettez à jour le quiz, ses questions et ses réponses.
          </p>
        </div>
      </div>

      <form className="teacher-form-card" onSubmit={handleSubmit}>
        <div className="teacher-form-grid">
          <div className="field">
            <label className="label">Titre du quiz</label>
            <input
              className="input"
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
            />
          </div>

          <div className="field">
            <label className="label">Cours associé</label>
            <select
              className="input"
              name="courseId"
              value={quiz.courseId}
              onChange={handleQuizChange}
            >
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
          <button type="button" className="btn btn--ghost">
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            Mettre à jour le quiz
          </button>
        </div>
      </form>
    </section>
  );
}