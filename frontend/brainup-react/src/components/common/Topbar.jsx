import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { fetchTopbarData } from "../../api/topbar";
import { logoutUser } from "../../api/auth";

export default function Topbar({
  role = "student",
  onToggleMobileMenu = () => {},
}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const [query, setQuery] = useState("");
  const [topbarData, setTopbarData] = useState({
    user: null,
    notifications: [],
    notifications_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    async function loadTopbar() {
      try {
        setLoading(true);
        const data = await fetchTopbarData();
        setTopbarData({
          user: data?.user || null,
          notifications: data?.notifications || [],
          notifications_count: data?.notifications_count || 0,
        });
      } catch (error) {
        console.error("Erreur topbar :", error);
      } finally {
        setLoading(false);
      }
    }

    loadTopbar();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector(".page-search-scope");
    if (!root) return;

    const marks = root.querySelectorAll("mark[data-search-highlight='true']");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });

    if (!query.trim()) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parentTag = node.parentElement?.tagName;
        if (
          ["SCRIPT", "STYLE", "MARK", "INPUT", "TEXTAREA", "BUTTON"].includes(
            parentTag
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    const search = query.toLowerCase();

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      const lower = text.toLowerCase();
      const index = lower.indexOf(search);

      if (index === -1) return;

      const before = text.slice(0, index);
      const match = text.slice(index, index + query.length);
      const after = text.slice(index + query.length);

      const fragment = document.createDocumentFragment();

      if (before) fragment.appendChild(document.createTextNode(before));

      const mark = document.createElement("mark");
      mark.setAttribute("data-search-highlight", "true");
      mark.style.background = "#fff3a3";
      mark.style.padding = "0 2px";
      mark.style.borderRadius = "4px";
      mark.textContent = match;
      fragment.appendChild(mark);

      if (after) fragment.appendChild(document.createTextNode(after));

      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }, [query]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Erreur logout :", error);
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

  function goToProfile() {
    if (role === "teacher") {
      navigate("/teacher/profile");
      return;
    }

    if (role === "student") {
      navigate("/student/profile");
      return;
    }

    navigate("/login");
  }

  const userName = topbarData?.user?.nom || "Utilisateur";
  const firstLetter = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        <button
          type="button"
          className="app-topbar__mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        <div className="app-topbar__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher un cours, quiz ou contenu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="app-topbar__right">
        <div className="app-topbar__hint">
          <Sparkles size={16} />
          <span>BrainUP smart</span>
        </div>

        <div className="app-topbar__notif" ref={notifRef}>
          <button
            className="app-topbar__iconbtn"
            onClick={() => setShowNotifMenu((prev) => !prev)}
            type="button"
          >
            <Bell size={18} />
            {topbarData.notifications_count > 0 && (
              <span className="app-topbar__badge">
                {topbarData.notifications_count}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="app-topbar__dropdown app-topbar__dropdown--notif">
              <div className="app-topbar__dropdown-title">Notifications</div>

              {topbarData.notifications.length > 0 ? (
                topbarData.notifications.map((notif, index) => (
                  <div key={index} className="app-topbar__notif-item">
                    <span className="app-topbar__notif-dot" />
                    <span>{notif.message}</span>
                  </div>
                ))
              ) : (
                <div className="app-topbar__empty">Aucune notification</div>
              )}
            </div>
          )}
        </div>

        <div className="app-topbar__user" ref={menuRef}>
          <button
            className="app-topbar__userbtn"
            onClick={() => setShowUserMenu((prev) => !prev)}
            type="button"
          >
            <div className="app-topbar__avatar">{firstLetter}</div>
            <div className="app-topbar__usertext">
              <span className="app-topbar__username">
                {loading ? "Chargement..." : userName}
              </span>
              <small className="app-topbar__role">
                {role === "teacher" ? "Enseignant" : "Étudiant"}
              </small>
            </div>
            <ChevronDown size={18} />
          </button>

          {showUserMenu && (
            <div className="app-topbar__dropdown">
              <button
                className="app-topbar__menuitem"
                onClick={goToProfile}
                type="button"
              >
                <User size={16} />
                <span>Mon profil</span>
              </button>

              <button
                className="app-topbar__menuitem app-topbar__menuitem--danger"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}