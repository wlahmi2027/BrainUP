import "../../styles/public/public-footer.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__content">
        <div>
          <h3>BrainUP</h3>
          <p>
            Plateforme e-learning intelligente pour étudiants, enseignants et
            administrateurs.
          </p>
        </div>

        <div>
          <h4>Navigation</h4>
          <ul>
            <li>
              <a href="#features">Fonctionnalités</a>
            </li>
            <li>
              <a href="#roles">Profils</a>
            </li>
            <li>
              <a href="#preview">Aperçu</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="mailto:support@brainup.com">support@brainup.com</a>
            </li>
            <li>
              <a href="tel:+212600000000">+212 6 00 00 00 00</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="public-footer__bottom">
        © 2026 BrainUP — Tous droits réservés
      </div>
    </footer>
  );
}