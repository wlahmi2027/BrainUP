export default function Profil() {
  return (
    <div className="card card--profile">
      {/* Header profil */}
      <div className="profileHeader">
        <div className="profileHeader__left">
          <div className="avatar">
            {/* si tu as une image :
              <img src={avatarImg} alt="Avatar" />
            */}
          </div>

          <div className="profileHeader__meta">
            <div className="profileHeader__name">Fran Dupont</div>
            <div className="profileHeader__sub">
              <span className="badgeLine">👥 &nbsp;Élève / Vie scolaire</span>
            </div>
          </div>
        </div>

        <div className="profileHeader__right">
          <button className="btn btn--primary" type="button">
            Modifier mon profil
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="formGrid">
        <div className="field">
          <label className="label">Nom</label>
          <div className="control">
            <input className="input" type="text" defaultValue="Fran Dupont" />
            <span className="fieldIcon">✎</span>
          </div>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="email"
              defaultValue="fran.dupont@email.com"
            />
            <span className="fieldIcon">✉️</span>
          </div>
        </div>

        <div className="field">
          <label className="label">Mot de passe</label>
          <div className="control">
            <input className="input" type="password" defaultValue="password" />
            <span className="fieldIcon">🔒</span>
          </div>
        </div>

        <div className="field">
          <label className="label">Rôle</label>
          <div className="control">
            <select className="input" defaultValue="Étudiant">
              <option>Étudiant</option>
              <option>Enseignant</option>
              <option>Admin</option>
            </select>
            <span className="fieldIcon">▾</span>
          </div>
        </div>

        <div className="formFooter">
          <div className="miniInfo">
            <span className="miniInfo__icon">📅</span>
            <span>Date d’inscription</span>
            <span className="miniInfo__value">07/04/2024</span>
          </div>

          <button className="btn btn--primary btn--wide" type="button">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}