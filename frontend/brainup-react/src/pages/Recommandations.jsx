export default function Recommandations() {
  return (
    <section className="page">
      <div className="recHeader">
        <h1 className="recHeader__title">
          Recommandations <span className="recHeader__pill">👁</span>
        </h1>
        <p className="recHeader__sub">
          Découvrez des cours suggérés selon vos intérêts.
        </p>
      </div>

      {/* Bloc recommandation */}
      <section className="card card--pad recBlock">
        <div className="card__head">
          <div className="recBlock__title">Recommandations & habitudes</div>
          <span className="dots">•••</span>
        </div>

        <div className="recCards">
          {/* Card 1 */}
          <article className="recCard recCard--green">
            <div className="recCard__left">
              <div className="recCard__icon">◯</div>
              <div>
                <div className="recCard__name">Analyse de Données</div>
                <div className="recCard__desc">Basé sur vos centres d’intérêt</div>
              </div>
            </div>
            <div className="recCard__right">
              <span className="chip">Voir</span>
            </div>
          </article>

          {/* Card 2 */}
          <article className="recCard recCard--blue">
            <div className="recCard__left">
              <div className="recCard__icon">🤖</div>
              <div>
                <div className="recCard__name">IA et Chatbots</div>
                <div className="recCard__desc">De nouvelles leçons adaptées</div>
              </div>
            </div>
            <div className="recCard__right">
              <span className="chip">Voir</span>
            </div>
          </article>
        </div>
      </section>

      {/* Historique */}
      <section className="card card--pad recHistory">
        <div className="card__head">
          <h2 className="card__title">Historique & Suggestions</h2>
          <span className="dots">•••</span>
        </div>

        <ul className="historyList">
          <li className="historyItem">
            <div className="historyItem__left">
              <span className="hico">✓</span>
              <div>
                <div className="htitle">Complétion de section “Variables”</div>
                <div className="hsub">Quiz JavaScript • amélioration</div>
              </div>
            </div>
            <div className="hdate">1 sept. 11:16</div>
          </li>

          <li className="historyItem">
            <div className="historyItem__left">
              <span className="hico">📍</span>
              <div>
                <div className="htitle">Recommandation : “Bases de Données”</div>
                <div className="hsub">Cours suggéré • niveau débutant</div>
              </div>
            </div>
            <div className="hdate">dim. 17:26</div>
          </li>

          <li className="historyItem">
            <div className="historyItem__left">
              <span className="hico">⏱</span>
              <div>
                <div className="htitle">Temps d’étude augmenté</div>
                <div className="hsub">+30 min • bonne régularité</div>
              </div>
            </div>
            <div className="hdate">sam. 15:30</div>
          </li>
        </ul>
      </section>

      {/* assistant */}
      <div className="assistFloat">
        <div className="assistFloat__avatar">👩</div>
        <div className="assistFloat__bubble">
          Bonjour! Comment puis-je vous aider?
        </div>
      </div>
    </section>
  );
}