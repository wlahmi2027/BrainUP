import heroImg from "../assets/img/hero.png";
import course1Img from "../assets/img/course1.png";
import course2Img from "../assets/img/course2.png";
import course3Img from "../assets/img/course3.png";
import reco1Img from "../assets/img/reco1.png";
import reco2Img from "../assets/img/reco2.png";

export default function Accueil() {
  return (
    <>
      {/* HERO */}
      <section className="hero card">
        <div className="hero__left">
          <h1>
            Bienvenue sur <span className="green">BrainUP</span>!
          </h1>
          <p>Apprenez intelligemment avec nous.</p>
          <button className="btn-primary" type="button">
            Découvrez-nous
          </button>
        </div>

        <div className="hero__right">
          <div className="halo halo--1"></div>
          <div className="halo halo--2"></div>
          <img src={heroImg} alt="Hero" />
        </div>
      </section>

      {/* GRID */}
      <div className="grid">
        {/* Cours Populaires */}
        <section className="card span-2">
          <div className="card__head">
            <h2>Cours Populaires</h2>
            <a className="link" href="#">
              Voir Plus →
            </a>
          </div>

          <div className="cards-3">
            <div className="course">
              <img src={course1Img} alt="course1" />
              <button className="btn-dark" type="button">
                Voir Plus →
              </button>
            </div>

            <div className="course">
              <img src={course2Img} alt="course2" />
              <button className="btn-dark" type="button">
                Voir Plus →
              </button>
            </div>

            <div className="course">
              <img src={course3Img} alt="course3" />
              <button className="btn-dark" type="button">
                Voir Plus →
              </button>
            </div>
          </div>
        </section>

        {/* Recommandé */}
        <section className="card">
          <div className="card__head">
            <h2>Recommandé Pour Vous</h2>
            <button className="dots" type="button">
              •••
            </button>
          </div>

          <div className="reco">
            <div className="reco__item">
              <img src={reco1Img} alt="reco1" />
            </div>
            <div className="reco__item">
              <img src={reco2Img} alt="reco2" />
            </div>
          </div>

          <div className="mini-bars">
            <div></div>
            <div></div>
          </div>
        </section>

        {/* Quiz */}
        <section className="card">
          <h2>Quiz en Cours</h2>

          <div className="quiz">
            <div className="quiz__title">Quiz JavaScript</div>
            <div className="quiz__sub">20 / 30 questions</div>
            <button className="btn-green" type="button">
              Continuer
            </button>
            <div className="quiz__bubble"></div>
          </div>
        </section>

        {/* Progression */}
        <section className="card">
          <h2>Progression</h2>

          <div className="progress">
            <div className="donut">
              <div className="donut__center">
                <div className="donut__pct">72%</div>
                <div className="donut__label">Complété</div>
              </div>
            </div>

            <div className="stats">
              <div className="stat">
                <span className="dot blue">●</span> Cours Suivis : <b>5</b>
              </div>
              <div className="stat">
                <span className="dot yellow">●</span> Quiz Réussis : <b>3</b>
              </div>
              <div className="stat">
                <span className="dot green">●</span> Temps d&apos;Étude : <b>12h</b>
              </div>
            </div>
          </div>
        </section>

        {/* Assistant */}
        <section className="card">
          <div className="card__head">
            <h2>Assistant Virtuel</h2>
            <button className="dots" type="button">
              •••
            </button>
          </div>

          <div className="assistant">
            <div className="assistant__avatar">A</div>
            <div className="assistant__bubble">
              Bonjour! Comment puis-je vous aider?
            </div>
          </div>

          <div className="chatbox">
            <input type="text" placeholder="Écrivez un message..." />
            <button className="btn-primary small" type="button">
              Envoyer
            </button>
          </div>
        </section>
      </div>
    </>
  );
}