import { useNavigate } from "react-router-dom";

export default function Deconnexion() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove login flag
    localStorage.removeItem("isLoggedIn");
    // Redirect to login page
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