import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Lock,
  GraduationCap,
  CalendarDays,
  PencilLine,
  Save,
  X,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { api } from "../../api/client";
import "../../styles/shared/profile.css";

function getRoleLabel(role) {
  if (role === "enseignant") return "Enseignant";
  if (role === "etudiant") return "Étudiant";
  if (role === "admin") return "Administrateur";
  return "Utilisateur";
}

function getFallbackProfile() {
  const rawUser = localStorage.getItem("user");
  const nom = localStorage.getItem("nom") || "";
  const email = localStorage.getItem("email") || "";
  const role = localStorage.getItem("role") || "";

  let parsedUser = null;
  try {
    parsedUser = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    parsedUser = null;
  }

  return {
    name: parsedUser?.nom || nom || "Utilisateur BrainUP",
    email: parsedUser?.email || email || "email@example.com",
    role: getRoleLabel(parsedUser?.role || role),
    rawRole: parsedUser?.role || role,
    signupDate: "—",
    specialty: "",
  };
}

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
    role: "",
    rawRole: "",
    signupDate: "",
    specialty: "",
  });

  const isTeacher = useMemo(
    () => form.rawRole === "enseignant" || form.role === "Enseignant",
    [form.rawRole, form.role]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setApiDown(false);

        const response = await api.get("/user/profile/");
        if (cancelled) return;

        const data = response.data || {};
        const fallback = getFallbackProfile();

        const normalizedProfile = {
          name: data?.name ?? data?.nom ?? data?.full_name ?? fallback.name,
          email: data?.email ?? fallback.email,
          role: getRoleLabel(data?.role ?? fallback.rawRole),
          rawRole: data?.role ?? fallback.rawRole,
          signupDate: data?.signupDate ?? data?.created_at ?? "—",
          specialty:
            data?.specialty ??
            data?.specialite ??
            data?.matiere ??
            fallback.specialty,
        };

        setProfile(normalizedProfile);
        setForm({
          ...normalizedProfile,
          password: "",
        });
      } catch (e) {
        if (cancelled) return;

        console.error("Erreur chargement profil :", e);

        const fallback = getFallbackProfile();

        setApiDown(true);
        setError("Backend profil indisponible. Affichage des données locales.");
        setProfile(fallback);
        setForm({
          ...fallback,
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
  }, []);

  function resetFormFromProfile(currentProfile) {
    if (!currentProfile) return;

    setForm({
      name: currentProfile.name,
      email: currentProfile.email,
      password: "",
      role: currentProfile.role,
      rawRole: currentProfile.rawRole,
      signupDate: currentProfile.signupDate,
      specialty: currentProfile.specialty || "",
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

      if (isTeacher && form.specialty.trim()) {
        payload.specialty = form.specialty.trim();
      }

      if (apiDown) {
        const updatedProfile = {
          name: form.name,
          email: form.email,
          role: form.role,
          rawRole: form.rawRole,
          signupDate: form.signupDate,
          specialty: form.specialty,
        };

        setProfile(updatedProfile);
        setForm((previous) => ({ ...previous, password: "" }));
        setIsEditing(false);
        setSuccess("Profil mis à jour localement.");
        return;
      }

      const response = await api.put("/user/profile/", payload);
      const data = response.data || {};

      const updatedProfile = {
        name: data?.name ?? data?.nom ?? data?.full_name ?? form.name,
        email: data?.email ?? form.email,
        role: getRoleLabel(data?.role ?? form.rawRole),
        rawRole: data?.role ?? form.rawRole,
        signupDate: data?.signupDate ?? data?.created_at ?? form.signupDate,
        specialty:
          data?.specialty ??
          data?.specialite ??
          data?.matiere ??
          form.specialty,
      };

      setProfile(updatedProfile);
      setForm({
        ...updatedProfile,
        password: "",
      });
      setIsEditing(false);
      setSuccess("Profil mis à jour avec succès.");
    } catch (e) {
      console.error("Erreur sauvegarde profil :", e);
      setError("Erreur lors de l’enregistrement du profil.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="shared-profile-page">
        <div className="shared-profile-card">
          <div className="shared-profile-loading">Chargement du profil...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="shared-profile-page">
      <div className="shared-profile-card">
        <div className="shared-profile-header">
          <div className="shared-profile-header__left">
            <div className="shared-profile-avatar">
              {form.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="shared-profile-header__meta">
              <div className="shared-profile-badge">
                <Sparkles size={14} />
                <span>Mon profil</span>
              </div>

              <h1 className="shared-profile-name">{form.name || "—"}</h1>

              <div className="shared-profile-sub">
                <span className="shared-profile-role">
                  <BadgeCheck size={14} />
                  {form.role}
                </span>
              </div>
            </div>
          </div>

          <div className="shared-profile-header__right">
            <button
              className={`shared-profile-btn ${
                isEditing
                  ? "shared-profile-btn--ghost"
                  : "shared-profile-btn--primary"
              }`}
              onClick={onToggleEdit}
              disabled={saving}
              type="button"
            >
              {isEditing ? (
                <>
                  <X size={16} />
                  <span>Annuler</span>
                </>
              ) : (
                <>
                  <PencilLine size={16} />
                  <span>Modifier mon profil</span>
                </>
              )}
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="shared-profile-messages">
            {error && (
              <div className="shared-profile-alert shared-profile-alert--error">
                {error}
              </div>
            )}

            {success && (
              <div className="shared-profile-alert shared-profile-alert--success">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="shared-profile-grid">
          <div className="shared-profile-field">
            <label className="shared-profile-label">
              <UserRound size={16} />
              <span>Nom complet</span>
            </label>

            <input
              className="shared-profile-input"
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              disabled={!isEditing || saving}
            />
          </div>

          <div className="shared-profile-field">
            <label className="shared-profile-label">
              <Mail size={16} />
              <span>Email</span>
            </label>

            <input
              className="shared-profile-input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              disabled={!isEditing || saving}
            />
          </div>

          <div className="shared-profile-field">
            <label className="shared-profile-label">
              <Lock size={16} />
              <span>Mot de passe</span>
            </label>

            <input
              className="shared-profile-input"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder={
                isEditing ? "Nouveau mot de passe (optionnel)" : "••••••••"
              }
              disabled={!isEditing || saving}
            />
          </div>

          {isTeacher && (
            <div className="shared-profile-field">
              <label className="shared-profile-label">
                <GraduationCap size={16} />
                <span>Spécialité</span>
              </label>

              <input
                className="shared-profile-input"
                type="text"
                name="specialty"
                value={form.specialty}
                onChange={onChange}
                disabled={!isEditing || saving}
                placeholder="Ex. Développement Web"
              />
            </div>
          )}

          <div className="shared-profile-field">
            <label className="shared-profile-label">
              <BadgeCheck size={16} />
              <span>Rôle</span>
            </label>

            <input
              className="shared-profile-input"
              type="text"
              value={form.role}
              disabled
            />
          </div>

          <div className="shared-profile-field">
            <label className="shared-profile-label">
              <CalendarDays size={16} />
              <span>Date d’inscription</span>
            </label>

            <input
              className="shared-profile-input"
              type="text"
              value={form.signupDate || "—"}
              disabled
            />
          </div>
        </div>

        <div className="shared-profile-footer">
          <div className="shared-profile-footer__info">
            {isTeacher ? "Profil enseignant BrainUP" : "Profil étudiant BrainUP"}
          </div>

          <button
            className="shared-profile-btn shared-profile-btn--primary shared-profile-btn--wide"
            onClick={onSave}
            disabled={!isEditing || saving}
            type="button"
          >
            <Save size={16} />
            <span>
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}