import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";
import "../../styles/public/public-navbar.css";

export default function PublicNavbar() {
  return (
    <header className="public-navbar">
      <div className="public-navbar__brand">
        <div className="public-navbar__logo">
          <FaBrain />
        </div>
        <span>
          Brain<span className="public-navbar__brand-accent">UP</span>
        </span>
      </div>

      <nav className="public-navbar__links">
        <a href="#features">Fonctionnalités</a>
        <a href="#roles">Profils</a>
        <a href="#preview">Aperçu</a>
        <a href="#faq">FAQ</a>
        <Link to="/login">Connexion</Link>
        <Link to="/inscription" className="public-navbar__cta">
          Inscription
        </Link>
      </nav>
    </header>
  );
}