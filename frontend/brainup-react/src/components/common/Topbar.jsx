import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchTopbarData } from "../../api/topbar";
import { logoutUser } from "../../api/auth";
import { Search, Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";

export default function Topbar() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    async function loadTopbar() {
      try {
        setLoading(true);
        const payload = await fetchTopbarData();
        setData(payload);
      } catch (err) {
        console.error("Erreur topbar :", err);
      } finally {
        setLoading(false);
      }
    }

    loadTopbar();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setOpenNotif(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setOpenUser(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await logoutUser();
      }
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");
      localStorage.removeItem("nom");
      localStorage.removeItem("email");
      navigate("/login");
    }
  }

  const user = data?.user || {
    nom: "Utilisateur",
    initial: "U",
    role: "",
  };

  const notifications = data?.notifications || [];
  const notificationsCount = data?.notifications_count || 0;

  const profileRoute =
    user.role === "enseignant"
      ? "/teacher/profile"
      : user.role === "etudiant"
      ? "/student/profile"
      : "/profile";

  return (
    <header className="topbar-dynamic">
      <div className="topbar-dynamic__search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Rechercher un cours, quiz ou contenu"
        />
      </div>

      <div className="topbar-dynamic__right">
        <div className="topbar-notif" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => setOpenNotif((prev) => !prev)}
          >
            <Bell size={18} />
            {notificationsCount > 0 && (
              <span className="topbar-badge">{notificationsCount}</span>
            )}
          </button>

          {openNotif && (
            <div className="topbar-dropdown topbar-dropdown--notif">
              <div className="topbar-dropdown__head">
                <h4>Notifications</h4>
              </div>

              <div className="topbar-notif-list">
                {notifications.length > 0 ? (
                  notifications.map((item, index) => (
                    <div key={index} className={`topbar-notif-item topbar-notif-item--${item.type}`}>
                      <div className="topbar-notif-item__title">{item.title}</div>
                      <div className="topbar-notif-item__message">{item.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="topbar-empty">Aucune notification.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-user" ref={userRef}>
          <button
            className="topbar-user__btn"
            onClick={() => setOpenUser((prev) => !prev)}
          >
            <div className="topbar-user__avatar">{user.initial}</div>
            <div className="topbar-user__text">
              <strong>Hi, {user.nom}</strong>
            </div>
            <ChevronDown size={16} />
          </button>

          {openUser && (
            <div className="topbar-dropdown topbar-dropdown--user">
              <Link to={profileRoute} className="topbar-menu-item">
                <User size={16} />
                Profil
              </Link>

              <Link to={profileRoute} className="topbar-menu-item">
                <Settings size={16} />
                Paramètres
              </Link>

              <button className="topbar-menu-item topbar-menu-item--danger" onClick={handleLogout}>
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}