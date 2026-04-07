import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Layers3,
  Eye,
  Clock3,
  Tag,
  ImagePlus,
  Sparkles,
  ArrowLeft,
  Save,
  UploadCloud,
} from "lucide-react";
import "../../styles/teacher/create-course.css";

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
    <section className="teacher-create-course-page">
      <div className="teacher-create-course-hero">
        <div>
          <div className="teacher-create-course-eyebrow">
            <Sparkles size={14} />
            <span>Nouveau contenu</span>
          </div>

          <h1 className="teacher-create-course-title">Créer un cours</h1>
          <p className="teacher-create-course-subtitle">
            Ajoutez un nouveau cours à votre espace enseignant avec une structure
            claire, une bannière et des informations bien organisées.
          </p>
        </div>

        <button
          type="button"
          className="teacher-create-course-back"
          onClick={() => navigate("/teacher/courses")}
        >
          <ArrowLeft size={16} />
          <span>Retour aux cours</span>
        </button>
      </div>

      {error && (
        <div className="teacher-create-course-alert teacher-create-course-alert--error">
          {error}
        </div>
      )}

      {success && (
        <div className="teacher-create-course-alert teacher-create-course-alert--success">
          {success}
        </div>
      )}

      <form className="teacher-create-course-card" onSubmit={handleSubmit}>
        <div className="teacher-create-course-grid">
          <div className="teacher-create-course-field teacher-create-course-field--full">
            <label className="teacher-create-course-label">
              <BookOpen size={16} />
              <span>Titre du cours</span>
            </label>
            <input
              className="teacher-create-course-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex. Introduction à Python"
            />
          </div>

          <div className="teacher-create-course-field teacher-create-course-field--full">
            <label className="teacher-create-course-label">
              <FileText size={16} />
              <span>Description</span>
            </label>
            <textarea
              className="teacher-create-course-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu, les objectifs et les compétences visées..."
              rows={6}
            />
          </div>

          <div className="teacher-create-course-field">
            <label className="teacher-create-course-label">
              <Layers3 size={16} />
              <span>Niveau</span>
            </label>
            <select
              className="teacher-create-course-input"
              name="niveau"
              value={form.niveau}
              onChange={handleChange}
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          <div className="teacher-create-course-field">
            <label className="teacher-create-course-label">
              <Eye size={16} />
              <span>Statut</span>
            </label>
            <select
              className="teacher-create-course-input"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
              <option value="archive">Archivé</option>
            </select>
          </div>

          <div className="teacher-create-course-field">
            <label className="teacher-create-course-label">
              <Clock3 size={16} />
              <span>Temps d’apprentissage (minutes)</span>
            </label>
            <input
              className="teacher-create-course-input"
              type="number"
              min="0"
              name="temps_apprentissage"
              value={form.temps_apprentissage}
              onChange={handleChange}
            />
          </div>

          <div className="teacher-create-course-field">
            <label className="teacher-create-course-label">
              <Tag size={16} />
              <span>Catégorie</span>
            </label>
            <input
              className="teacher-create-course-input"
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ex. Programmation"
            />
          </div>

          <div className="teacher-create-course-field teacher-create-course-field--full">
            <label className="teacher-create-course-label">
              <ImagePlus size={16} />
              <span>Bannière du cours</span>
            </label>

            <div className="teacher-create-course-upload">
              {preview ? (
                <div className="teacher-create-course-preview-wrap">
                  <img
                    src={preview}
                    alt="Aperçu bannière"
                    className="teacher-create-course-preview"
                  />
                </div>
              ) : (
                <div className="teacher-create-course-upload-placeholder">
                  <UploadCloud size={24} />
                  <span>Ajoutez une bannière pour valoriser votre cours</span>
                </div>
              )}

              <input
                className="teacher-create-course-file"
                type="file"
                name="banniere"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="teacher-create-course-actions">
          <button
            type="button"
            className="teacher-create-course-btn teacher-create-course-btn--ghost"
            onClick={() => navigate("/teacher/courses")}
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span>Annuler</span>
          </button>

          <button
            type="submit"
            className="teacher-create-course-btn teacher-create-course-btn--primary"
            disabled={loading}
          >
            <Save size={16} />
            <span>{loading ? "Création..." : "Créer le cours"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}