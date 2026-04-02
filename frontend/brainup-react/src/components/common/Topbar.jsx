import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { fetchTopbarData } from "../../api/topbar";
import { logoutUser } from "../../api/auth";

export default function Topbar() {
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
        if (["SCRIPT", "STYLE", "MARK", "INPUT", "TEXTAREA", "BUTTON"].includes(parentTag)) {
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

  const userName = topbarData?.user?.nom || "Utilisateur";
  const firstLetter = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="topbar topbar-modern">
      <div className="topbar-modern__search">
        <Search size={20} />
        <input
          type="text"
          placeholder="Rechercher un cours, quiz ou contenu"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="topbar-modern__right">
        <div className="topbar-modern__notif" ref={notifRef}>
          <button
            className="topbar-modern__iconbtn"
            onClick={() => setShowNotifMenu((prev) => !prev)}
            type="button"
          >
            <Bell size={20} />
            {topbarData.notifications_count > 0 && (
              <span className="topbar-modern__badge">
                {topbarData.notifications_count}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="topbar-modern__dropdown topbar-modern__dropdown--notif">
              <div className="topbar-modern__dropdown-title">Notifications</div>

              {topbarData.notifications.length > 0 ? (
                topbarData.notifications.map((notif, index) => (
                  <div key={index} className="topbar-modern__notif-item">
                    <span className="topbar-modern__notif-dot" />
                    <span>{notif.message}</span>
                  </div>
                ))
              ) : (
                <div className="topbar-modern__empty">
                  Aucune notification
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-modern__user" ref={menuRef}>
          <button
            className="topbar-modern__userbtn"
            onClick={() => setShowUserMenu((prev) => !prev)}
            type="button"
          >
            <div className="topbar-modern__avatar">{firstLetter}</div>
            <span className="topbar-modern__username">
              {loading ? "Chargement..." : `Hi, ${userName}`}
            </span>
            <ChevronDown size={18} />
          </button>

          {showUserMenu && (
            <div className="topbar-modern__dropdown">
              <button
                className="topbar-modern__menuitem"
                onClick={() => navigate("/teacher/profile")}
                type="button"
              >
                <User size={16} />
                <span>Mon profil</span>
              </button>

              <button
                className="topbar-modern__menuitem topbar-modern__menuitem--danger"
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