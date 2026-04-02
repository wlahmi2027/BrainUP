import { NavLink } from "react-router-dom";

export default function Sidebar({ role = "student" }) {
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
        {role === "student" && (
          <>
            <NavLink className={linkClass} to="/student/accueil">
              🏠 Accueil
            </NavLink>

            <NavLink className={linkClass} to="/student/dashboard">
              📊 Tableau de bord
            </NavLink>

            <NavLink className={linkClass} to="/student/courses">
              📘 Cours
            </NavLink>

            <NavLink className={linkClass} to="/student/quiz">
              ✅ Quiz
            </NavLink>

            <NavLink className={linkClass} to="/student/recommendations">
              ⭐ Recommandations
            </NavLink>

            <NavLink className={linkClass} to="/student/profile">
              👤 Profil
            </NavLink>

            <NavLink className={linkClass} to="/student/chatbot">
              💬 Chatbot
            </NavLink>
          </>
        )}

        {role === "teacher" && (
          <>
            <NavLink className={linkClass} to="/teacher/dashboard">
              📊 Dashboard
            </NavLink>

            <NavLink className={linkClass} to="/teacher/courses">
              📘 Mes cours
            </NavLink>

            <NavLink className={linkClass} to="/teacher/quiz">
              📝 Quiz
            </NavLink>


            <NavLink className={linkClass} to="/teacher/students">
              👨‍🎓 Étudiants
            </NavLink>

            <NavLink className={linkClass} to="/teacher/students-results">
              📋 Suivi étudiants
            </NavLink>

            <NavLink className={linkClass} to="/teacher/profile">
              👨‍🏫 Profil
            </NavLink>

            <NavLink className={linkClass} to="/teacher/chatbot">
              💬 Chatbot
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink className={linkClass} to="/admin/dashboard">
              📊 Tableau de bord
            </NavLink>

            <NavLink className={linkClass} to="/admin/Users">
              👤 Utilisateurs
            </NavLink>

            <NavLink className={linkClass} to="/admin/courses">
              📘 Cours
            </NavLink>

            <NavLink className={linkClass} to="/admin/quiz">
              ✅ Quiz
            </NavLink>

            <NavLink className={linkClass} to="/admin/results">
              📈 Résultats
            </NavLink>

            <NavLink className={linkClass} to="/admin/students-results">
              📋 Suivi étudiants
            </NavLink>
          </>
        )}

        <NavLink className={linkClass} to="/deconnexion">
          🚪 Déconnexion
        </NavLink>
      </nav>
    </aside>
  );
}