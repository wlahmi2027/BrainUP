import course1Img from "../assets/img/course1.png";
import course2Img from "../assets/img/course2.png";
import course3Img from "../assets/img/course3.png";
import reco1Img from "../assets/img/reco1.png";
import reco2Img from "../assets/img/reco2.png";

export default function Cours() {
  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Catalogue des Cours</h1>

          <div className="filters">
            <button className="chip is-active" type="button">
              🎯 Contenu
            </button>
            <button className="chip" type="button">
              📚 Filtrer
            </button>
            <button className="chip" type="button">
              📈 Mes Progressions
            </button>
            <button className="chip" type="button">
              ⭐ Mes plus aimés
            </button>
          </div>
        </div>

        <div className="page__right">
          <button className="btn btn--soft" type="button">
            Ress lister ▾
          </button>
        </div>
      </div>

      <div className="sectionhead">
        <div className="sectionhead__title">Nos Cours</div>
        <a className="sectionhead__link" href="#">
          choix volonté →
        </a>
      </div>

      {/* COURSES GRID */}
      <div className="coursesgrid">
        {/* Card 1 */}
        <article className="course">
          <div className="course__img">
            <img src={course1Img} alt="Introduction à Python" />
          </div>
          <div className="course__body">
            <h3 className="course__title">Introduction à Python</h3>

            <div className="course__meta">
              <div className="avatarmini">👩</div>
              <div className="course__author">
                <div className="course__name">Léa Théode</div>
                <div className="course__sub">Cours & exercices</div>
              </div>
              <div className="stars" aria-label="4.5 étoiles">
                ★★★★☆
              </div>
            </div>

            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>

        {/* Card 2 */}
        <article className="course">
          <div className="course__img">
            <img src={course2Img} alt="Machine Learning Avancé" />
          </div>
          <div className="course__body">
            <h3 className="course__title">Machine Learning Avancé</h3>

            <div className="course__meta">
              <div className="avatarmini">👨</div>
              <div className="course__author">
                <div className="course__name">Léo Martin</div>
                <div className="course__sub">Cours & exercices</div>
              </div>
              <div className="stars" aria-label="5 étoiles">
                ★★★★★
              </div>
            </div>

            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>

        {/* Card 3 */}
        <article className="course">
          <div className="course__img">
            <img src={course3Img} alt="Design Web Moderne" />
          </div>
          <div className="course__body">
            <h3 className="course__title">Design Web Moderne</h3>

            <div className="course__meta">
              <div className="avatarmini">👩</div>
              <div className="course__author">
                <div className="course__name">Inès M.</div>
                <div className="course__sub">Cours & exercices</div>
              </div>
              <div className="stars" aria-label="4 étoiles">
                ★★★★☆
              </div>
            </div>

            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>

        {/* Card 4 */}
        <article className="course">
          <div className="course__img">
            <img src={reco1Img} alt="Analyse de Données" />
          </div>
          <div className="course__body">
            <h3 className="course__title">Analyse de Données</h3>
            <div className="course__meta">
              <div className="avatarmini">👨</div>
              <div className="course__author">
                <div className="course__name">Adam K.</div>
                <div className="course__sub">Cours & exercices</div>
              </div>
              <div className="stars" aria-label="4 étoiles">
                ★★★★☆
              </div>
            </div>
            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>

        {/* Card 5 */}
        <article className="course">
          <div className="course__img">
            <img src={reco2Img} alt="IA et Chatbots" />
          </div>
          <div className="course__body">
            <h3 className="course__title">IA et Chatbots</h3>
            <div className="course__meta">
              <div className="avatarmini">🤖</div>
              <div className="course__author">
                <div className="course__name">Bot BrainUP</div>
                <div className="course__sub">Cours suggéré</div>
              </div>
              <div className="stars" aria-label="5 étoiles">
                ★★★★★
              </div>
            </div>
            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>

        {/* Card 6 */}
        <article className="course">
          <div className="course__img">
            <img src={course2Img} alt="Sécurité Informatique" />
          </div>
          <div className="course__body">
            <h3 className="course__title">Sécurité Informatique</h3>
            <div className="course__meta">
              <div className="avatarmini">🛡️</div>
              <div className="course__author">
                <div className="course__name">Nora S.</div>
                <div className="course__sub">Cours & exercices</div>
              </div>
              <div className="stars" aria-label="4 étoiles">
                ★★★★☆
              </div>
            </div>
            <div className="course__actions">
              <a className="btn btn--primary" href="#">
                Voir Cours
              </a>
              <button className="btn btn--ghost" type="button">
                🧾 Mes notes
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}