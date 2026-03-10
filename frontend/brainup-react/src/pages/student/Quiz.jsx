import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Quiz() {
  const options = useMemo(
    () => [
      { id: 1, text: "stop()", correct: false },
      { id: 2, text: "exit()", correct: true },
      { id: 3, text: "break", correct: false },
      { id: 4, text: "stop_execution()", correct: false },
    ],
    []
  );

  const [pickedId, setPickedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const picked = options.find((option) => option.id === pickedId) || null;
  const isCorrect = submitted && picked ? picked.correct : false;

  function onPick(id) {
    if (submitted) return;
    setPickedId(id);
  }

  function onValidate() {
    if (!picked) return;
    setSubmitted(true);
  }

  function onReset() {
    setPickedId(null);
    setSubmitted(false);
  }

  function getOptClass(option) {
    let className = "qOpt";

    if (pickedId === option.id) {
      className += " is-picked";
    }

    if (submitted) {
      if (pickedId === option.id) {
        className += option.correct ? " is-correct" : " is-wrong";
      }

      if (pickedId !== option.id && picked && !picked.correct && option.correct) {
        className += " is-correct";
      }
    }

    return className;
  }

  function getOptStateText(option) {
    if (!submitted) return "";

    if (pickedId === option.id) {
      return option.correct ? "✓ Correct" : "✕ Faux";
    }

    if (picked && !picked.correct && option.correct) {
      return "✓ Bonne réponse";
    }

    return "";
  }

  return (
    <section className="page">
      <div className="crumbs">
        <Link to="/student/dashboard">Dashboard</Link>
        <span className="sep">›</span>
        <Link to="/student/courses">Cours</Link>
        <span className="sep">›</span>
        <span className="here">Quiz Python</span>
      </div>

      <h1 className="quizTitle">
        Quiz : <span>Introduction à Python</span>
      </h1>

      <div className="quizGrid">
        <section className="card card--pad quizCard">
          <div className="qBanner">
            <div className="qBanner__text">
              <div className="qBanner__q">
                Quelle instruction permet d’interrompre un programme en Python ?
              </div>
              <div className="qBanner__sub">QCM • 1 seule bonne réponse</div>
            </div>
            <div className="qBanner__bot">🤖+</div>
          </div>

          <div className="qList">
            {options.map((option) => (
              <button
                key={option.id}
                className={getOptClass(option)}
                type="button"
                disabled={submitted}
                onClick={() => onPick(option.id)}
              >
                <span className="qNum">{option.id}.</span>
                <span className="qTxt">{option.text}</span>
                <span className="qState">{getOptStateText(option)}</span>
              </button>
            ))}
          </div>

          <button
            className="qValidate"
            type="button"
            disabled={!picked || submitted}
            onClick={onValidate}
          >
            Valider la réponse
          </button>

          {submitted && (
            <div style={{ marginTop: "12px" }}>
              <div className="assistant__bubble">
                {isCorrect
                  ? "Bravo ! Votre réponse est correcte."
                  : "Réponse incorrecte. La bonne réponse est : exit()."}
              </div>

              <div style={{ marginTop: "10px" }}>
                <button className="btn btn--soft" type="button" onClick={onReset}>
                  Recommencer
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card card--pad quizChat">
          <div className="quizChat__row">
            <div className="quizChat__avatar">👩</div>
            <div className="quizChat__bubble">
              Besoin d’aide pour ce quiz ? Posez votre question à l’assistant.
            </div>
          </div>

          <div className="quizChat__inputRow">
            <input
              className="quizChat__input"
              placeholder="Écrire un message..."
            />
            <button className="quizChat__send" type="button">
              ➤
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}