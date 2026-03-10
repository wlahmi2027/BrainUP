import { useMemo, useState } from "react";

export default function Dashboard() {
  const [progress] = useState({
    percent: 72,
    objectifsLabel: "Objectifs atteints",
    checklist: [
      { text: "Cours terminés", value: "8 / 12" },
      { text: "Quiz réussis", value: "14 / 18" },
      { text: "Temps d'apprentissage", value: "26h" },
    ],
  });

  const statsCards = useMemo(
    () => [
      {
        kpi: "12 cours",
        name: "Cours suivis",
        ctaLeft: "Voir",
        ctaRight: "Continuer",
      },
      {
        kpi: "87%",
        name: "Taux de réussite",
        ctaLeft: "Détails",
        ctaRight: "Améliorer",
      },
    ],
    []
  );

  const suggestions = useMemo(
    () => [
      { icon: "🧠", title: "Quiz JavaScript avancé" },
      { icon: "⚛️", title: "Quiz React Hooks" },
      { icon: "🗄️", title: "Quiz Bases de données" },
    ],
    []
  );

  const topQuiz = useMemo(
    () => [
      {
        icon: "🥇",
        name: "React Fundamentals",
        period: "Cette semaine",
        score: "18/20",
        label: "Meilleur score",
      },
      {
        icon: "🚀",
        name: "API REST",
        period: "Dernier passage",
        score: "16/20",
        label: "Très bon résultat",
      },
      {
        icon: "💡",
        name: "Algorithmes",
        period: "Ce mois-ci",
        score: "15/20",
        label: "À retravailler",
      },
    ],
    []
  );

  const user = useMemo(
    () => ({
      initial: "B",
    }),
    []
  );

  return (
    <section className="page">
      <div className="dashhead">
        <h1 className="dashhead__title">Tableau de bord étudiant</h1>
        <button className="btn btn--soft">Mes dernières activités ▾</button>
      </div>

      <div className="dashgrid">
        <div className="dashleft">
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Ma progression</h2>
              <span className="dots">•••</span>
            </div>

            <div className="progressrow">
              <div className="donutwrap">
                <div className="donut" style={{ "--p": progress.percent }}>
                  <div className="donut__inner">
                    <div className="donut__num">{progress.percent}%</div>
                    <div className="donut__label">Complété</div>
                  </div>
                </div>
              </div>

              <div className="progstats">
                <div className="progstats__big">
                  <div className="progstats__label">Objectifs</div>
                  <div className="progstats__value">{progress.percent}%</div>
                  <div className="progstats__sub">{progress.objectifsLabel}</div>
                </div>

                <ul className="checklist">
                  {progress.checklist.map((item, index) => (
                    <li key={index}>
                      <span className="check">✓</span>
                      {item.text} <span className="muted">— {item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Statistiques de cours</h2>
              <button className="btn btn--ghost">Voir plus</button>
            </div>

            <div className="statcards">
              {statsCards.map((card, index) => (
                <article className="statmedia" key={index}>
                  <div
                    className={`statmedia__thumb ${
                      index === 0
                        ? "statmedia__thumb--blue"
                        : "statmedia__thumb--navy"
                    }`}
                  >
                    <div className="statmedia__kpi">
                      <div className="kpi__top">{card.kpi}</div>
                      <div className="kpi__name">{card.name}</div>
                    </div>
                  </div>

                  <div className="statmedia__actions">
                    <button className="btn btn--ghost">{card.ctaLeft}</button>
                    <button className="btn btn--primary">{card.ctaRight}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashright">
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Suggestions de quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="suglist">
              {suggestions.map((item, index) => (
                <div className="sugitem" key={index}>
                  <div className="sugicon">{item.icon}</div>
                  <div className="sugtext">
                    <div className="sugtitle">{item.title}</div>
                  </div>
                </div>
              ))}

              <button
                className="btn btn--soft"
                style={{ width: "100%", marginTop: 10 }}
              >
                Voir plus ▾
              </button>
            </div>
          </section>

          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Top quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="toplist">
              {topQuiz.map((item, index) => (
                <div className="toprow" key={index}>
                  <div className="topleft">
                    <div className="topicon">{item.icon}</div>
                    <div>
                      <div className="topname">{item.name}</div>
                      <div className="topsub">{item.period}</div>
                    </div>
                  </div>

                  <div className="topscore">
                    <div className="topbig">{item.score}</div>
                    <div className="topsub">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="assistFloat">
        <div className="assistFloat__avatar">{user.initial}</div>
        <div className="assistFloat__bubble">
          Bonjour, comment puis-je vous aider ?
        </div>
      </div>
    </section>
  );
}