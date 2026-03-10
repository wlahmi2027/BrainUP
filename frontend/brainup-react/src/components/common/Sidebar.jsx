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
        <NavLink className={linkClass} to="/">
          🏠 Accueil
        </NavLink>

        <NavLink className={linkClass} to="/student/courses">
          📘 Cours
        </NavLink>

        <NavLink className={linkClass} to="/student/dashboard">
          📊 Tableau de bord
        </NavLink>

        <NavLink className={linkClass} to="/student/recommendations">
          ⭐ Recommandations
        </NavLink>

        <NavLink className={linkClass} to="/student/quiz">
          ✅ Quiz
        </NavLink>

        <NavLink className={linkClass} to="/chatbot">
          💬 Chatbot
        </NavLink>

        <NavLink className={linkClass} to="/student/profile">
          👤 Profil
        </NavLink>

        <NavLink className={linkClass} to="/deconnexion">
          🚪 Déconnexion
        </NavLink>
      </nav>
    </aside>
  );
}