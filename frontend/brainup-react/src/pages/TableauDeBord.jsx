export default function TableauDeBord() {
  return (
    <section className="page">
      <div className="dashhead">
        <h1 className="dashhead__title">Tableau de Bord</h1>
        <button className="btn btn--soft" type="button">
          Mes dernières ▾
        </button>
      </div>

      <div className="dashgrid">
        {/* LEFT COL */}
        <div className="dashleft">
          {/* Progress */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Ma Progression</h2>
              <span className="dots">•••</span>
            </div>

            <div className="progressrow">
              {/* Donut */}
              <div className="donutwrap">
                <div className="donut" style={{ "--p": 72 }}>
                  <div className="donut__inner">
                    <div className="donut__num">72%</div>
                    <div className="donut__label">Complété</div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="progstats">
                <div className="progstats__big">
                  <div className="progstats__label">Objectifs</div>
                  <div className="progstats__value">72%</div>
                  <div className="progstats__sub">Cette semaine</div>
                </div>

                <ul className="checklist">
                  <li>
                    <span className="check">✓</span> Cours terminés cette semaine{" "}
                    <span className="muted">— 2</span>
                  </li>
                  <li>
                    <span className="check">✓</span> Notes et progrès collectés{" "}
                    <span className="muted">— 2</span>
                  </li>
                  <li>
                    <span className="check">✓</span> Révisions et tests terminés{" "}
                    <span className="muted">— +200</span>
                  </li>
                  <li>
                    <span className="check">✓</span> Rapport envoyé{" "}
                    <span className="muted">— filtre de l’étudiant</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course stats */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Statistiques de Cours</h2>
              <a className="tinyLink" href="#">
                Voir plus
              </a>
            </div>

            <div className="statcards">
              <article className="statmedia">
                <div className="statmedia__thumb statmedia__thumb--blue">
                  <div className="statmedia__kpi">
                    <div className="kpi__top">8657</div>
                    <div className="kpi__name">Quiz JavaScript</div>
                  </div>
                </div>

                <div className="statmedia__actions">
                  <button className="btn btn--ghost" type="button">
                    📌 Favoris
                  </button>
                  <button className="btn btn--primary" type="button">
                    S'inscrire
                  </button>
                </div>
              </article>

              <article className="statmedia">
                <div className="statmedia__thumb statmedia__thumb--navy">
                  <div className="statmedia__kpi">
                    <div className="kpi__top">IA & Chatbots</div>
                    <div className="kpi__name">Cours IA & Chatbots</div>
                  </div>
                </div>

                <div className="statmedia__actions">
                  <button className="btn btn--ghost" type="button">
                    📄 Détails
                  </button>
                  <button className="btn btn--primary" type="button">
                    Voir activité
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        {/* RIGHT COL */}
        <aside className="dashright">
          {/* Suggestions */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Suggestions de Quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="suglist">
              <div className="sugitem">
                <div className="sugicon">🧠</div>
                <div className="sugtitle">
                  Algorithmique et Structures de Données
                </div>
              </div>

              <div className="sugitem">
                <div className="sugicon">💻</div>
                <div className="sugtitle">HTML & CSS</div>
              </div>

              <div className="sugitem">
                <div className="sugicon">🗄️</div>
                <div className="sugtitle">Base de Données</div>
              </div>

              <button
                className="btn btn--soft"
                style={{ width: "100%", marginTop: "10px" }}
                type="button"
              >
                Your Picks ▾
              </button>
            </div>
          </section>

          {/* Top Quiz */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Top Quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="toplist">
              <div className="toprow">
                <div className="topleft">
                  <div className="topicon">🏆</div>
                  <div>
                    <div className="topname">Les Algorithmes</div>
                    <div className="topsub">Semaine</div>
                  </div>
                </div>
                <div className="topscore">
                  <div className="topbig">177/100</div>
                  <div className="topsub">Record</div>
                </div>
              </div>

              <div className="toprow">
                <div className="topleft">
                  <div className="topicon">🐍</div>
                  <div>
                    <div className="topname">Python</div>
                    <div className="topsub">Semaine</div>
                  </div>
                </div>
                <div className="topscore">
                  <div className="topbig">4/10</div>
                  <div className="topsub">Score</div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* Floating assistant */}
      <div className="assistFloat">
        <div className="assistFloat__avatar">👩</div>
        <div className="assistFloat__bubble">
          Bonjour! Comment puis-je vous aider?
        </div>
      </div>
    </section>
  );
}