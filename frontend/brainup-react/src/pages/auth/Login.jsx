import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight, FaBrain } from "react-icons/fa";
import { loginUser } from "../../api/auth";
import "../../styles/auth/login.css";

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
        const role = data.user?.role || "";
        const user = {
          id: data.user?.id || "",
          nom: data.user?.nom || "Utilisateur",
          role,
          email: data.user?.email || "",
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", String(user.id));
        localStorage.setItem("role", user.role);
        localStorage.setItem("nom", user.nom);
        localStorage.setItem("email", user.email);
        localStorage.setItem("user", JSON.stringify(user));

        if (role === "etudiant") {
          navigate("/student/dashboard", { replace: true });
        } else if (role === "enseignant") {
          navigate("/teacher/dashboard", { replace: true });
        } else if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
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
    <div className="login-page">
      <div className="login-page__orb login-page__orb--one" />
      <div className="login-page__orb login-page__orb--two" />

      <div className="login-layout">
        <div className="login-side">
          <Link to="/" className="login-brand">
            <div className="login-brand__logo">
              <FaBrain />
            </div>
            <span>
              Brain<span className="login-brand__accent">UP</span>
            </span>
          </Link>

          <span className="login-side__badge">Connexion</span>

          <h1 className="login-side__title">
            Bon retour sur <span>BrainUP</span>
          </h1>

          <p className="login-side__text">
            Connectez-vous pour accéder à votre espace étudiant, enseignant ou
            administrateur dans une interface moderne, claire et responsive.
          </p>

          <div className="login-side__card">
            <strong>Accès rapide</strong>
            <p>
              Reprenez vos cours, gérez vos contenus ou consultez vos
              statistiques dès votre connexion.
            </p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card__head">
            <h2>Connexion</h2>
            <p>Entrez vos identifiants pour continuer.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <div className="login-input-wrap">
                <FaEnvelope className="login-input-wrap__icon" />
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@email.com"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Mot de passe</label>
              <div className="login-input-wrap">
                <FaLock className="login-input-wrap__icon" />
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              <span>{loading ? "Connexion..." : "Se connecter"}</span>
              {!loading && <FaArrowRight />}
            </button>
          </form>

          <div className="login-card__footer">
            <span>Pas encore de compte ?</span>
            <Link to="/inscription">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}