import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    niveau: "debutant",
    status: "brouillon",
    temps_apprentissage: "0",
    category: "",
    banniere: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "banniere") {
      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        banniere: file,
      }));

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      if (file) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Le titre du cours est obligatoire.";
    }

    if (!form.description.trim()) {
      return "La description du cours est obligatoire.";
    }

    if (!form.niveau) {
      return "Le niveau du cours est obligatoire.";
    }

    if (!form.status) {
      return "Le statut du cours est obligatoire.";
    }

    if (
      form.temps_apprentissage === "" ||
      Number(form.temps_apprentissage) < 0
    ) {
      return "Le temps d'apprentissage doit être supérieur ou égal à 0.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("niveau", form.niveau);
      formData.append("temps_apprentissage", form.temps_apprentissage || "0");
      formData.append("status", form.status);
      formData.append("category", form.category?.trim() || "");

      if (form.banniere) {
        formData.append("banniere", form.banniere);
      }

      const response = await fetch("http://127.0.0.1:8001/api/courses/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Erreur lors de la création du cours."
        );
      }

      setSuccess("Cours créé avec succès.");

      setTimeout(() => {
        navigate("/teacher/courses");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors de la création du cours.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="teacher-page">
      <div className="teacher-page__header">
        <div>
          <h1>Créer un cours</h1>
          <p>Ajoutez un nouveau cours à votre espace enseignant.</p>
        </div>
      </div>

      {error && <div className="teacher-alert teacher-alert--error">{error}</div>}
      {success && (
        <div className="teacher-alert teacher-alert--success">{success}</div>
      )}

      <form className="teacher-form-card" onSubmit={handleSubmit}>
        <div className="teacher-form-grid">
          <div className="teacher-field teacher-field--full">
            <label className="label">Titre du cours</label>
            <input
              className="input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex. Introduction à Python"
            />
          </div>

          <div className="teacher-field teacher-field--full">
            <label className="label">Description</label>
            <textarea
              className="teacher-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu et les objectifs du cours..."
              rows={5}
            />
          </div>

          <div className="teacher-field">
            <label className="label">Niveau</label>
            <select
              className="input"
              name="niveau"
              value={form.niveau}
              onChange={handleChange}
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          <div className="teacher-field">
            <label className="label">Statut</label>
            <select
              className="input"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="archive">Archivé</option>
            </select>
          </div>

          <div className="teacher-field">
            <label className="label">Temps d’apprentissage (minutes)</label>
            <input
              className="input"
              type="number"
              min="0"
              name="temps_apprentissage"
              value={form.temps_apprentissage}
              onChange={handleChange}
            />
          </div>

          <div className="teacher-field">
            <label className="label">Catégorie</label>
            <input
              className="input"
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ex. Programmation"
            />
          </div>
          <div className="teacher-field teacher-field--full">
            <label className="label">Bannière</label>

            {preview && (
              <div style={{ marginBottom: "12px" }}>
                <img
                  src={preview}
                  alt="Aperçu bannière"
                  style={{
                    width: "240px",
                    maxWidth: "100%",
                    borderRadius: "12px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <input
              type="file"
              name="banniere"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="teacher-form-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/teacher/courses")}
            disabled={loading}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer le cours"}
          </button>
        </div>
      </form>
    </section>
  );
}