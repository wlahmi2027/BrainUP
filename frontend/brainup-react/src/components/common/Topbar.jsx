import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ name: "Utilisateur", role: "student", email: "" });

  // Load user from localStorage on mount and whenever it changes
  useEffect(() => {
    function loadUser() {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setUser({
            name: parsed?.name?.trim() || "Utilisateur",
            role: parsed?.role || "student",
            email: parsed?.email || ""
          });
        } catch {
          setUser({ name: "Utilisateur", role: "student", email: "" });
        }
      } else {
        setUser({ name: "Utilisateur", role: "student", email: "" });
      }
    }

    loadUser();

    // Listen for changes to localStorage (e.g., another tab)
    function handleStorageChange(e) {
      if (e.key === "user") loadUser();
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      navigate("/student/courses");
    }
  }

  return (
    <header className="topbar">
      <div className="search">
        <span className="search__icon">🔎</span>
        <input
          className="search__input"
          placeholder="Rechercher un cours, quiz ou contenu"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <div className="topbar__actions">
        <button className="iconbtn" title="Notifications">
          🔔
          <span className="notif-badge">3</span>
        </button>

        <div className="userpill" ref={menuRef}>
          <button
            type="button"
            className="userpill__btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <div className="userpill__avatar">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="userpill__text">
              Hi, <b>{user.name}</b>
            </div>
            <div className="userpill__chev">▾</div>
          </button>

          {open && (
            <div className="userpill__menu">
              <Link
                className="userpill__item"
                to="/student/profile"
                onClick={() => setOpen(false)}
              >
                👤 Profil
              </Link>

              <button className="userpill__item danger" onClick={logout}>
                🚪 Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}