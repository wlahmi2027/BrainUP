import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    "nav__item" + (isActive ? " active" : "");

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__logo">🧠</div>
        <div className="brand__name">
          Brain<span>UP</span>
        </div>
      </div>

      <nav className="nav">
        <NavLink className={linkClass} to="/">🏠 Accueil</NavLink>
        <NavLink className={linkClass} to="/cours">📘 Cours</NavLink>
        <NavLink className={linkClass} to="/tableau-de-bord">📊 Tableau de bord</NavLink>
        <NavLink className={linkClass} to="/recommandations">⭐ Recommandations</NavLink>
        <NavLink className={linkClass} to="/quiz">✅ Quiz</NavLink>
        <NavLink className={linkClass} to="/chatbot">💬 Chatbot</NavLink>
        <NavLink className={linkClass} to="/profil">👤 Profil</NavLink>
        <NavLink className={linkClass} to="/deconnexion">🚪 Déconnexion</NavLink>
      </nav>
    </aside>
  );
}