import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client"; // adjust path if needed

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("etudiant"); // default role
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    // Send data to backend
    const response = await api.post("register/", {
        nom,
        email,
        mot_de_passe: password,
        role, // either "etudiant" or "enseignant"
    });

    const data = response.data;

    if (data.success) {
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        navigate("/login"); // redirect to login page
    } else {
        alert(data.message || "Erreur lors de l'inscription");
    }
    } catch (err) {
    console.error(err);

    // Check if backend returned a response
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
              Inscription
            </h2>

            <form onSubmit={handleSignUp} className="formGrid">
              <div className="field">
                <label className="label">Nom</label>
                <input
                  className="input"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>

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

              <div className="field">
                <label className="label">Rôle</label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--wide"
                style={{ marginTop: "20px" }}
                disabled={loading}
              >
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <span>Déjà un compte ? </span>
              <a href="/login" className="btn btn--secondary">
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}