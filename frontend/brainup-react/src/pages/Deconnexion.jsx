import { useNavigate } from "react-router-dom";
import { api } from "../api/client";



export default function Deconnexion() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("logout/");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("courses");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <section className="content">
      <div className="logoutWrap">
        <div className="logoutCard">
          <h1 className="logoutTitle">Se déconnecter ?</h1>
          <p className="logoutSub">Voulez-vous vraiment vous déconnecter ?</p>

          <div className="logoutIllustration">
            <div className="logoutGuy">🧑‍💻</div>
            <div className="logoutPower">⏻</div>
          </div>

          <div className="logoutBtns">
            <button className="btnGhost" onClick={() => navigate("/")}>
              Annuler
            </button>
            <button className="btnDanger" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>

          <div className="logoutChat">
            <div className="logoutChat__avatar"></div>
            <div className="logoutChat__bubble">
              Bonjour ! Comment puis-je vous aider ?
            </div>
            <button className="logoutChat__send" type="button" title="Ouvrir Chat">
              💬
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}