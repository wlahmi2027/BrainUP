import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles/auth/deconnexion.css";


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
        </div>
      </div>
    </section>
  );
}