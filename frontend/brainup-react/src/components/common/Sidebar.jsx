import { NavLink } from "react-router-dom";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Sparkles,
  UserRound,
  MessageCircleMore,
  LogOut,
  GraduationCap,
  Users,
  FileQuestion,
  X,
  FileText,
  BarChart2,
} from "lucide-react";

export default function Sidebar({
  role = "student",
  mobileMenuOpen = false,
  onCloseMobileMenu = () => { },
}) {
  const linkClass = ({ isActive }) =>
    `app-sidebar__link ${isActive ? "is-active" : ""}`;

  function handleNavClick() {
    onCloseMobileMenu();
  }

  return (
    <aside
      className={`app-sidebar ${mobileMenuOpen ? "is-mobile-open" : ""}`}
    >
      <div className="app-sidebar__mobile-top">
        <button
          type="button"
          className="app-sidebar__mobile-close"
          onClick={onCloseMobileMenu}
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">
          <Brain size={22} />
        </div>
        <div className="app-sidebar__brand-text">
          Brain<span>UP</span>
        </div>
      </div>

      <div className="app-sidebar__section-label">
        {role === "student" ? "Espace étudiant" : "Navigation"}
      </div>

      <nav className="app-sidebar__nav">
        {role === "student" && (
          <>
            <NavLink
              className={linkClass}
              to="/student/dashboard"
              onClick={handleNavClick}
            >
              <LayoutDashboard size={18} />
              <span>Tableau de bord</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/student/courses"
              onClick={handleNavClick}
            >
              <BookOpen size={18} />
              <span>Cours</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/student/quiz"
              onClick={handleNavClick}
            >
              <ClipboardCheck size={18} />
              <span>Quiz</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/student/recommendations"
              onClick={handleNavClick}
            >
              <Sparkles size={18} />
              <span>Recommandations</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/student/chatbot"
              onClick={handleNavClick}
            >
              <MessageCircleMore size={18} />
              <span>Chatbot</span>
            </NavLink>
          </>
        )}

        {role === "teacher" && (
          <>
            <NavLink
              className={linkClass}
              to="/teacher/dashboard"
              onClick={handleNavClick}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/teacher/courses"
              onClick={handleNavClick}
            >
              <GraduationCap size={18} />
              <span>Mes cours</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/teacher/quiz"
              onClick={handleNavClick}
            >
              <FileQuestion size={18} />
              <span>Quiz</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/teacher/students"
              onClick={handleNavClick}
            >
              <Users size={18} />
              <span>Étudiants</span>
            </NavLink>

            <NavLink
              className={linkClass}
              to="/teacher/chatbot"
              onClick={handleNavClick}
            >
              <MessageCircleMore size={18} />
              <span>Chatbot</span>
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink className={linkClass} 
            to="/admin/users" 
            onClick={handleNavClick}>
              <Users size={18} />
              <span>Utilisateurs</span>
            </NavLink>

            <NavLink className={linkClass} 
            to="/admin/courses" 
            onClick={handleNavClick}>
              <FileText size={18} />
              <span>Cours</span>
            </NavLink>
          </>
        )}


      </nav>

      <div className="app-sidebar__footer">
        <NavLink
          className={linkClass}
          to="/deconnexion"
          onClick={handleNavClick}
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </NavLink>
      </div>
    </aside>
  );
}