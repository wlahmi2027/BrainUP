import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { name: "Frant", role: "student" };
      const parsed = JSON.parse(raw);
      return {
        name: parsed?.name || "Frant",
        role: parsed?.role || "student",
      };
    } catch {
      return { name: "Frant", role: "student" };
    }
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

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/deconnexion");
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