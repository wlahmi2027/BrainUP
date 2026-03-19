import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.success) {
        /* Store token */
        localStorage.setItem("token", data.token);
        /* Store full user info in localStorage */
        const user = {
          name: data.user?.nom || "Utilisateur",
          role: data.user?.role || "student",
          email: data.user?.email || ""
        };
        localStorage.setItem("user", JSON.stringify(user));

        /* Redirect based on role */
        switch (user.role) {
          case "etudiant":
            navigate("/student/accueil");
            break;
          case "enseignant":
            navigate("/teacher/accueil");
            break;
          case "admin":
            navigate("/admin/");
            break;
          default:
            navigate("/");
        }
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

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <span>Pas encore de compte ? </span>
              <Link to="/inscription" className="btn btn--secondary">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}