import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function Profil() {
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // données venant du backend
  const [profile, setProfile] = useState(null);

  // formulaire (modifiable)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "", // souvent on ne renvoie pas le mdp, mais on le garde si tu veux
    role: "Étudiant",
    signupDate: "07/04/2024",
  });

  // ⚠️ endpoints (change-les selon ton backend)
  const endpoints = useMemo(
    () => ({
      get: "/user/profile/",  // exemple: /api/user/profile/
      put: "/user/profile/",  // exemple: /api/user/profile/
    }),
    []
  );

  // GET profile au chargement
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await api.get(endpoints.get);

        if (cancelled) return;

        // adapte mapping selon ton backend
        const data = res.data;

        setProfile(data);

        setForm({
          name: data?.name ?? data?.full_name ?? "Fran Dupont",
          email: data?.email ?? "fran.dupont@email.com",
          password: "",
          role: data?.role ?? "Étudiant",
          signupDate: data?.signupDate ?? data?.created_at ?? "07/04/2024",
        });
      } catch (e) {
        if (cancelled) return;
        setError(
          "Impossible de charger le profil. Vérifie que le backend est lancé et que l’URL est correcte."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [endpoints.get]);

  function onToggleEdit() {
    setSuccess("");
    setError("");

    // si on annule, on remet les valeurs initiales
    if (isEditing && profile) {
      setForm({
        name: profile?.name ?? profile?.full_name ?? "Fran Dupont",
        email: profile?.email ?? "fran.dupont@email.com",
        password: "",
        role: profile?.role ?? "Étudiant",
        signupDate: profile?.signupDate ?? profile?.created_at ?? "07/04/2024",
      });
    }

    setIsEditing((v) => !v);
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // payload envoyé au backend (adapte les clés si besoin)
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      // on envoie le password seulement si rempli
      if (form.password?.trim()) payload.password = form.password.trim();

      const res = await api.put(endpoints.put, payload);

      // on considère que le backend renvoie le profil mis à jour
      const updated = res.data;

      setProfile(updated);
      setIsEditing(false);
      setForm((f) => ({ ...f, password: "" }));
      setSuccess("✅ Profil mis à jour avec succès !");
    } catch (e) {
      setError("❌ Erreur lors de l’enregistrement. Vérifie le backend et les champs.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="content">
        <div className="card card--profile" style={{ padding: 18 }}>
          <h2>Chargement du profil…</h2>
          <p style={{ marginTop: 8, color: "#64748b", fontWeight: 700 }}>
            Attends une seconde.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="content">
      <div className="card card--profile">
        {/* Header profil */}
        <div className="profileHeader">
          <div className="profileHeader__left">
            <div className="avatar" />

            <div className="profileHeader__meta">
              <div className="profileHeader__name">{form.name || "—"}</div>
              <div className="profileHeader__sub">
                <span className="badgeLine">👥 &nbsp;Élève / Vie scolaire</span>
              </div>
            </div>
          </div>

          <div className="profileHeader__right">
            <button className="btn btn--primary" onClick={onToggleEdit} disabled={saving}>
              {isEditing ? "Annuler" : "Modifier mon profil"}
            </button>
          </div>
        </div>

        {/* messages */}
        <div style={{ padding: "12px 8px 0" }}>
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,.10)",
                border: "1px solid rgba(239,68,68,.25)",
                padding: "10px 12px",
                borderRadius: 14,
                color: "#991b1b",
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "rgba(34,197,94,.10)",
                border: "1px solid rgba(34,197,94,.25)",
                padding: "10px 12px",
                borderRadius: 14,
                color: "#166534",
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              {success}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="formGrid">
          <div className="field">
            <label className="label">Nom</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                disabled={!isEditing || saving}
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
                onChange={onChange}
                disabled={!isEditing || saving}
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
                onChange={onChange}
                placeholder={isEditing ? "Nouveau mot de passe (optionnel)" : "••••••••"}
                disabled={!isEditing || saving}
              />
              <span className="fieldIcon">🔒</span>
            </div>
          </div>

          <div className="field">
            <label className="label">Rôle</label>
            <div className="control">
              <select
                className="input"
                name="role"
                value={form.role}
                onChange={onChange}
                disabled={!isEditing || saving}
              >
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
              <span className="miniInfo__value">{form.signupDate}</span>
            </div>

            <button
              className="btn btn--primary btn--wide"
              onClick={onSave}
              disabled={!isEditing || saving}
              title={!isEditing ? "Clique sur Modifier mon profil d’abord" : ""}
            >
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}