import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight, FaBrain } from "react-icons/fa";
import "../../styles/auth/passwordreset.css";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8001/api/auth/confirm-temp-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            temp_password: tempPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur");
        return;
      }

      alert("Mot de passe mis à jour");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Erreur serveur, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__orb login-page__orb--one" />
      <div className="login-page__orb login-page__orb--two" />

      <div className="login-layout">
        {/* LEFT SIDE */}
        <div className="login-side">
          <Link to="/" className="login-brand">
            <div className="login-brand__logo">
              <FaBrain />
            </div>
            <span>
              Brain<span className="login-brand__accent">UP</span>
            </span>
          </Link>

          <span className="login-side__badge">Réinitialisation</span>

          <h1 className="login-side__title">
            Sécurisez votre <span>compte</span>
          </h1>

          <p className="login-side__text">
            Entrez votre email, votre mot de passe temporaire et définissez un
            nouveau mot de passe pour restaurer l’accès à votre compte.
          </p>

          <div className="login-side__card">
            <strong>Important</strong>
            <p>
              Le mot de passe temporaire est à usage unique et peut expirer.
              Contactez un administrateur si nécessaire.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-card">
          <div className="login-card__head">
            <h2>Réinitialisation</h2>
            <p>Créez un nouveau mot de passe sécurisé.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
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

            {/* TEMP PASSWORD */}
            <div className="login-field">
              <label>Mot de passe temporaire</label>
              <div className="login-input-wrap">
                <FaLock className="login-input-wrap__icon" />
                <input
                  className="login-input"
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="login-field">
              <label>Nouveau mot de passe</label>
              <div className="login-input-wrap">
                <FaLock className="login-input-wrap__icon" />
                <input
                  className="login-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="login-field">
              <label>Confirmer le mot de passe</label>
              <div className="login-input-wrap">
                <FaLock className="login-input-wrap__icon" />
                <input
                  className="login-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>{loading ? "Validation..." : "Réinitialiser"}</span>
              {!loading && <FaArrowRight />}
            </button>
          </form>

          <div className="login-card__footer">
            <span>Retour à la connexion ?</span>
            <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}