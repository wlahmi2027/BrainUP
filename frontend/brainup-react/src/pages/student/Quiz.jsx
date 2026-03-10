import { useMemo, useState } from "react";

export default function Quiz() {
  // Options du quiz (on reprend ton HTML)
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

  const picked = options.find((o) => o.id === pickedId) || null;

  function onPick(id) {
    if (submitted) return;
    setPickedId(id);
  }

  function onValidate() {
    if (!picked) return;
    setSubmitted(true);
  }

  // Helpers pour classes / états
  function getOptClass(opt) {
    let cls = "qOpt";
    if (pickedId === opt.id) cls += " is-picked";

    if (submitted) {
      // après validation : marquer la réponse choisie
      if (pickedId === opt.id) cls += opt.correct ? " is-correct" : " is-wrong";

      // si choix faux : montrer aussi la bonne réponse
      if (pickedId !== opt.id && picked && !picked.correct && opt.correct) {
        cls += " is-correct";
      }
    }
    return cls;
  }

  function getOptStateText(opt) {
    if (!submitted) return "";
    if (pickedId === opt.id) return opt.correct ? "✓ Correct" : "✕ Faux";

    if (picked && !picked.correct && opt.correct) return "✓ Correct";
    return "";
  }

  return (
    <section className="page">
      {/* breadcrumb */}
      <div className="crumbs">
        <a href="#">Quiz</a>
        <span className="sep">›</span>
        <a href="#">Ressource</a>
        <span className="sep">›</span>
        <span className="here">1 Farms</span>
      </div>

      <h1 className="quizTitle">
        Quiz: <span>Introduction à Python</span>
      </h1>

      <div className="quizGrid">
        {/* QUIZ CARD */}
        <section className="card card--pad quizCard">
          {/* header banner */}
          <div className="qBanner">
            <div className="qBanner__text">
              <div className="qBanner__q">
                Comment déclencher un arrêt en Python ?
              </div>
              <div className="qBanner__sub">QCM • 1 bonne réponse</div>
            </div>
            <div className="qBanner__bot">🤖+</div>
          </div>

          {/* answer list */}
          <div className="qList" id="qList">
            {options.map((opt) => (
              <button
                key={opt.id}
                className={getOptClass(opt)}
                type="button"
                disabled={submitted}
                onClick={() => onPick(opt.id)}
              >
                <span className="qNum">{opt.id}.</span>
                <span className="qTxt">{opt.text}</span>
                <span className="qState">{getOptStateText(opt)}</span>
              </button>
            ))}
          </div>

          {/* validate */}
          <button
            className="qValidate"
            type="button"
            disabled={!picked || submitted}
            onClick={onValidate}
          >
            Valider la Reponse
          </button>
        </section>

        {/* CHAT BOX LIKE THE DESIGN */}
        <section className="card card--pad quizChat">
          <div className="quizChat__row">
            <div className="quizChat__avatar">👩</div>
            <div className="quizChat__bubble">Besoin d’aide pour ce quiz ?</div>
          </div>

          <div className="quizChat__inputRow">
            <input className="quizChat__input" placeholder="Écrire un message..." />
            <button className="quizChat__send" type="button">
              ➤
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}