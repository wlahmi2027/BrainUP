import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client"; // adjust path if needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend login endpoint
      const response = await api.post("login/", {
        email: email,
        mot_de_passe: password, // matches your database field
      });

      const data = response.data;

      if (data.success) {
        // For now, just save a login flag
        localStorage.setItem("isLoggedIn", "true");
        navigate("/tableau-de-bord");
      } else {
        alert(data.message || "Email ou mot de passe invalide");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        alert("Email ou mot de passe invalide");
      } else {
        alert("Erreur serveur, veuillez réessayer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg">
      <div
        className="shell"
        style={{ maxWidth: "400px", gridTemplateColumns: "1fr" }}
      >
        <div className="main" style={{ padding: "40px 24px" }}>
          <div className="card card--pad login-card">
            <h2
              style={{ marginBottom: "20px", fontWeight: 900, fontSize: "24px" }}
            >
              Login
            </h2>
            <form onSubmit={handleLogin} className="formGrid">
              <div className="field">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label className="label">Mot de passe</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--wide"
                style={{ marginTop: "20px" }}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}