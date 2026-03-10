import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";

const FALLBACK_PROFILE = {
  name: "Fran Dupont",
  email: "fran.dupont@email.com",
  role: "Étudiant",
  signupDate: "07/04/2024",
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [apiDown, setApiDown] = useState(false);

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Étudiant",
    signupDate: "",
  });

  const endpoints = useMemo(
    () => ({
      get: "/user/profile/",
      put: "/user/profile/",
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setApiDown(false);

        const response = await api.get(endpoints.get);
        if (cancelled) return;

        const data = response.data || {};

        const normalizedProfile = {
          name: data?.name ?? data?.full_name ?? FALLBACK_PROFILE.name,
          email: data?.email ?? FALLBACK_PROFILE.email,
          role: data?.role ?? FALLBACK_PROFILE.role,
          signupDate:
            data?.signupDate ?? data?.created_at ?? FALLBACK_PROFILE.signupDate,
        };

        setProfile(normalizedProfile);
        setForm({
          ...normalizedProfile,
          password: "",
        });
      } catch (e) {
        if (cancelled) return;

        console.error("Erreur chargement profil :", e);
        setApiDown(true);
        setError("Backend profil indisponible. Affichage des données locales.");

        setProfile(FALLBACK_PROFILE);
        setForm({
          ...FALLBACK_PROFILE,
          password: "",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [endpoints]);

  function resetFormFromProfile(currentProfile) {
    if (!currentProfile) return;

    setForm({
      name: currentProfile.name,
      email: currentProfile.email,
      password: "",
      role: currentProfile.role,
      signupDate: currentProfile.signupDate,
    });
  }

  function onToggleEdit() {
    setError("");
    setSuccess("");

    if (isEditing) {
      resetFormFromProfile(profile);
    }

    setIsEditing((value) => !value);
  }

  function onChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function onSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (apiDown) {
        const updatedProfile = {
          name: form.name,
          email: form.email,
          role: form.role,
          signupDate: form.signupDate,
        };

        setProfile(updatedProfile);
        setForm((previous) => ({ ...previous, password: "" }));
        setIsEditing(false);
        setSuccess("✅ Profil mis à jour localement.");
        return;
      }

      const response = await api.put(endpoints.put, payload);
      const data = response.data || {};

      const updatedProfile = {
        name: data?.name ?? data?.full_name ?? form.name,
        email: data?.email ?? form.email,
        role: data?.role ?? form.role,
        signupDate:
          data?.signupDate ?? data?.created_at ?? form.signupDate,
      };

      setProfile(updatedProfile);
      setForm({
        ...updatedProfile,
        password: "",
      });
      setIsEditing(false);
      setSuccess("✅ Profil mis à jour avec succès.");
    } catch (e) {
      console.error("Erreur sauvegarde profil :", e);
      setError("❌ Erreur lors de l’enregistrement du profil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="card card--profile">
          <h2>Chargement du profil…</h2>
          <p style={{ marginTop: "8px", color: "#64748b", fontWeight: 700 }}>
            Veuillez patienter un instant.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card card--profile">
        <div className="profileHeader">
          <div className="profileHeader__left">
            <div className="avatar" />

            <div className="profileHeader__meta">
              <div className="profileHeader__name">{form.name || "—"}</div>
              <div className="profileHeader__sub">
                <span className="badgeLine">👨‍🎓 {form.role}</span>
              </div>
            </div>
          </div>

          <div className="profileHeader__right">
            <button
              className="btn btn--primary"
              onClick={onToggleEdit}
              disabled={saving}
            >
              {isEditing ? "Annuler" : "Modifier mon profil"}
            </button>
          </div>
        </div>

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

        <div className="formGrid">
          <div className="field">
            <label className="label">Nom complet</label>
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
                placeholder={
                  isEditing
                    ? "Nouveau mot de passe (optionnel)"
                    : "••••••••"
                }
                disabled={!isEditing || saving}
              />
              <span className="fieldIcon">🔒</span>
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
              <span className="miniInfo__icon">📅</span>
              <span>Date d’inscription</span>
              <span className="miniInfo__value">{form.signupDate}</span>
            </div>

            <button
              className="btn btn--primary btn--wide"
              onClick={onSave}
              disabled={!isEditing || saving}
              title={!isEditing ? "Activez le mode édition d’abord" : ""}
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}