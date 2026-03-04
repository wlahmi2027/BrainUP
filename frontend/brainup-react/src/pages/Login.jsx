import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // TODO: replace with API call to Django
    if (email === "test@example.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true"); // temp auth flag
      navigate("/tableau-de-bord"); // redirect after login
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="bg">
      <div className="shell" style={{ maxWidth: "400px", gridTemplateColumns: "1fr" }}>
        <div className="main" style={{ padding: "40px 24px" }}>
          <div className="card card--pad login-card">
            <h2 style={{ marginBottom: "20px", fontWeight: 900, fontSize: "24px" }}>Login</h2>
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
                <label className="label">Password</label>
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
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}