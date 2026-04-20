import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaArrowRight, FaBrain } from "react-icons/fa";
import "../../styles/auth/passwordreset.css";

export default function PasswordForgotten() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8001/api/auth/password-forgotten/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erreur");
        return;
      }

      setSent(true);
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
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

          <span className="login-side__badge">Support</span>

          <h1 className="login-side__title">
            Mot de passe <span>oublié</span>
          </h1>

          <p className="login-side__text">
            Indiquez votre email pour signaler la perte de votre mot de passe.
            Un administrateur vous assistera pour réinitialiser votre accès.
          </p>

          <div className="login-side__card">
            <strong>Traitement</strong>
            <p>
              Votre demande sera transmise aux administrateurs de la plateforme.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-card">
          <div className="login-card__head">
            <h2>Demande d’accès</h2>
            <p>Entrez votre email pour envoyer une demande.</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="login-form">
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

              <button type="submit" className="login-submit" disabled={loading}>
                <span>{loading ? "Envoi..." : "Envoyer la demande"}</span>
                {!loading && <FaArrowRight />}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: "20px", color: "#2457a7", fontWeight: 700 }}>
              Demande envoyée. Un administrateur va traiter votre requête.
            </div>
          )}

          <div className="login-card__footer">
            <span>Retour à la connexion ?</span>
            <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}