import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // user fallback (plus tard tu mettras le vrai user depuis backend)
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { name: "Frant" };
      const parsed = JSON.parse(raw);
      return { name: parsed?.name || "Frant" };
    } catch {
      return { name: "Frant" };
    }
  }, []);

  // fermer dropdown quand on clique dehors
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
      // pour l’instant on fait juste une navigation vers /cours (ou tu peux faire /search)
      navigate("/cours");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/deconnexion");
  }

  return (
    <header className="topbar">
      <div className="search">
        <span className="search__icon">🔎</span>
        <input
          className="search__input"
          placeholder="Rechercher un message"
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
            <div className="userpill__avatar">H</div>
            <div className="userpill__text">
              Hi, <b>{user.name}</b>
            </div>
            <div className="userpill__chev">▾</div>
          </button>

          {open && (
            <div className="userpill__menu">
              <Link className="userpill__item" to="/profil" onClick={() => setOpen(false)}>
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