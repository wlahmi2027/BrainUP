import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaArrowRight,
  FaBrain,
} from "react-icons/fa";
import { api } from "../../api/client";
import "../../styles/auth/inscription.css";

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("etudiant");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("register/", {
        nom,
        email,
        mot_de_passe: password,
        role,
      });

      const data = response.data;

      if (data.success) {
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        navigate("/login");
      } else {
        alert(data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);

      if (err.response && err.response.data) {
        const backendMsg = err.response.data.message;
        alert(backendMsg || "Erreur lors de l'inscription");
      } else {
        alert("Erreur serveur, veuillez réessayer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-page__orb signup-page__orb--one" />
      <div className="signup-page__orb signup-page__orb--two" />

      <div className="signup-layout">
        <div className="signup-side">
          <Link to="/" className="signup-brand">
            <div className="signup-brand__logo">
              <FaBrain />
            </div>
            <span>
              Brain<span className="signup-brand__accent">UP</span>
            </span>
          </Link>

          <span className="signup-side__badge">Inscription</span>

          <h1 className="signup-side__title">
            Rejoignez <span>BrainUP</span>
          </h1>

          <p className="signup-side__text">
            Créez votre compte pour commencer à apprendre, enseigner ou
            administrer dans une plateforme moderne, cohérente et agréable.
          </p>

          <div className="signup-side__card">
            <strong>Une seule plateforme</strong>
            <p>
              Étudiants, enseignants et administrateurs profitent d’une
              expérience claire et alignée avec la page d’accueil.
            </p>
          </div>
        </div>

        <div className="signup-card">
          <div className="signup-card__head">
            <h2>Inscription</h2>
            <p>Créez votre compte en quelques secondes.</p>
          </div>

          <form onSubmit={handleSignUp} className="signup-form">
            <div className="signup-field">
              <label>Nom</label>
              <div className="signup-input-wrap">
                <FaUser className="signup-input-wrap__icon" />
                <input
                  className="signup-input"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="signup-field">
              <label>Email</label>
              <div className="signup-input-wrap">
                <FaEnvelope className="signup-input-wrap__icon" />
                <input
                  className="signup-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@email.com"
                />
              </div>
            </div>

            <div className="signup-field">
              <label>Mot de passe</label>
              <div className="signup-input-wrap">
                <FaLock className="signup-input-wrap__icon" />
                <input
                  className="signup-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="signup-field">
              <label>Rôle</label>
              <div className="signup-input-wrap">
                <FaUserTag className="signup-input-wrap__icon" />
                <select
                  className="signup-input signup-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>
            </div>

            <button type="submit" className="signup-submit" disabled={loading}>
              <span>{loading ? "Inscription..." : "Créer mon compte"}</span>
              {!loading && <FaArrowRight />}
            </button>
          </form>

          <div className="signup-card__footer">
            <span>Déjà un compte ?</span>
            <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}