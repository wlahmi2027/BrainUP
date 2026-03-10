import { useState } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Dr. Nadia Benali",
    email: "nadia.benali@brainup.com",
    password: "",
    specialty: "Développement Web",
    role: "Enseignant",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleToggleEdit() {
    setIsEditing((value) => !value);
  }

  function handleSave() {
    setIsEditing(false);
  }

  return (
    <section className="page teacher-page">
      <div className="card card--profile">
        <div className="profileHeader">
          <div className="profileHeader__left">
            <div className="avatar" />
            <div className="profileHeader__meta">
              <div className="profileHeader__name">{form.name}</div>
              <div className="profileHeader__sub">
                <span className="badgeLine">👩‍🏫 {form.role}</span>
              </div>
            </div>
          </div>

          <div className="profileHeader__right">
            <button className="btn btn--primary" onClick={handleToggleEdit}>
              {isEditing ? "Annuler" : "Modifier mon profil"}
            </button>
          </div>
        </div>

        <div className="formGrid">
          <div className="field">
            <label className="label">Nom complet</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <span className="fieldIcon">✎</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <span className="fieldIcon">✉️</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Mot de passe</label>
            <div className="control">
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nouveau mot de passe"
                disabled={!isEditing}
              />
              <span className="fieldIcon">🔒</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Spécialité</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <span className="fieldIcon">🎓</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Rôle</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="role"
                value={form.role}
                disabled
              />
              <span className="fieldIcon">👤</span>
            </div>
          </div>

          <div className="formFooter">
            <div className="miniInfo">
              <span className="miniInfo__icon">ℹ️</span>
              <span>Profil enseignant BrainUP</span>
            </div>

            <button
              className="btn btn--primary btn--wide"
              onClick={handleSave}
              disabled={!isEditing}
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}