export default function Chatbot() {
  return (
    <section className="content">
      <div className="chatWrap">
        <div className="chatCard">
          <div className="chatTitle">
            <div className="chatTitle__icon">🤖</div>
            <div>
              <div className="chatTitle__h1">Chatbot</div>
              <div className="chatTitle__p">
                Bienvenue ! Comment puis-je vous aider ?
              </div>
            </div>
          </div>

          {/* bubble */}
          <div className="chatHello">
            <div className="chatHello__avatar"></div>
            <div className="chatHello__bubble">
              Bonjour ! Comment puis-je vous aider ?
            </div>
          </div>

          {/* actions */}
          <div className="chatActions">
            <button className="chatAction" type="button">
              <span className="chatAction__ico">📘</span>
              <span>Reprendre mon dernier cours</span>
              <span className="chatAction__chev">›</span>
            </button>

            <button className="chatAction" type="button">
              <span className="chatAction__ico">⭐</span>
              <span>Mes recommandations de cours</span>
              <span className="chatAction__chev">›</span>
            </button>

            <button className="chatAction" type="button">
              <span className="chatAction__ico">✅</span>
              <span>Parlez-moi des quiz disponibles</span>
              <span className="chatAction__chev">›</span>
            </button>
          </div>

          {/* quick questions */}
          <div className="chatSection">
            <div className="chatSection__title">
              Comment puis-je vous aider ?
            </div>

            <div className="chatQuick">
              <button className="chatQuick__item" type="button">
                Se baser sur ton niveau et te proposer un plan ?
                <span>›</span>
              </button>

              <button className="chatQuick__item" type="button">
                Me faire un résumé du cours “Python” ?
                <span>›</span>
              </button>

              <button className="chatQuick__item" type="button">
                Me donner des exercices pour m’entraîner ?
                <span>›</span>
              </button>
            </div>
          </div>

          {/* input bottom */}
          <div className="chatComposer">
            <button
              className="chatComposer__attach"
              type="button"
              title="Joindre"
            >
              📎
            </button>

            <input
              className="chatComposer__input"
              placeholder="Écrire un message..."
            />

            <button
              className="chatComposer__send"
              type="button"
              title="Envoyer"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}