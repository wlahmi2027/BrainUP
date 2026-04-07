import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PencilLine,
  Tag,
  Layers3,
  Eye,
  Clock3,
  FileText,
  ImagePlus,
  ArrowLeft,
  Save,
  Trash2,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import "../../styles/teacher/edit-course.css";

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "debutant",
    description: "",
    status: "brouillon",
    temps_apprentissage: 0,
    banniere: null,
  });

  const [currentBannerUrl, setCurrentBannerUrl] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDelete() {
    if (!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8001/api/courses/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data?.message || "Erreur lors de la suppression.");
      }

      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCourse() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8001/api/courses/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) throw new Error("Impossible de récupérer le cours");

        const data = await res.json();

        setForm({
          title: data.title || "",
          category: data.category || "",
          level: data.niveau || "debutant",
          description: data.description || "",
          status: data.status || "brouillon",
          temps_apprentissage: data.temps_apprentissage || 0,
          banniere: null,
        });

        setCurrentBannerUrl(data.banniere || null);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchCourse();
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    if (name === "banniere") {
      const file = files?.[0] || null;

      setForm((prev) => ({
        ...prev,
        banniere: file,
      }));

      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      if (file) {
        setBannerPreview(URL.createObjectURL(file));
      } else {
        setBannerPreview(null);
      }

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("niveau", form.level);
    formData.append("temps_apprentissage", form.temps_apprentissage);
    formData.append("status", form.status);
    formData.append("category", form.category);
    if (form.banniere) formData.append("banniere", form.banniere);

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8001/api/courses/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Erreur lors de la mise à jour du cours.");
      }

      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="teacher-edit-course-page">
      <div className="teacher-edit-course-hero">
        <div>
          <div className="teacher-edit-course-eyebrow">
            <Sparkles size={14} />
            <span>Édition</span>
          </div>

          <h1 className="teacher-edit-course-title">Modifier le cours</h1>
          <p className="teacher-edit-course-subtitle">
            Mettez à jour les informations, la bannière et le statut de votre cours.
          </p>
        </div>

        <button
          type="button"
          className="teacher-edit-course-back"
          onClick={() => navigate("/teacher/courses")}
        >
          <ArrowLeft size={16} />
          <span>Retour aux cours</span>
        </button>
      </div>

      {error && (
        <div className="teacher-edit-course-alert teacher-edit-course-alert--error">
          {error}
        </div>
      )}

      <form className="teacher-edit-course-card" onSubmit={handleSubmit}>
        <div className="teacher-edit-course-grid">
          <div className="teacher-edit-course-field teacher-edit-course-field--full">
            <label className="teacher-edit-course-label">
              <PencilLine size={16} />
              <span>Titre du cours</span>
            </label>
            <input
              className="teacher-edit-course-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex. Introduction à Django"
              required
            />
          </div>

          <div className="teacher-edit-course-field">
            <label className="teacher-edit-course-label">
              <Tag size={16} />
              <span>Catégorie</span>
            </label>
            <input
              className="teacher-edit-course-input"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ex. Backend"
            />
          </div>

          <div className="teacher-edit-course-field">
            <label className="teacher-edit-course-label">
              <Layers3 size={16} />
              <span>Niveau</span>
            </label>
            <select
              className="teacher-edit-course-input"
              name="level"
              value={form.level}
              onChange={handleChange}
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          <div className="teacher-edit-course-field">
            <label className="teacher-edit-course-label">
              <Eye size={16} />
              <span>Statut</span>
            </label>
            <select
              className="teacher-edit-course-input"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
            </select>
          </div>

          <div className="teacher-edit-course-field">
            <label className="teacher-edit-course-label">
              <Clock3 size={16} />
              <span>Temps d’apprentissage</span>
            </label>
            <input
              className="teacher-edit-course-input"
              type="number"
              name="temps_apprentissage"
              value={form.temps_apprentissage}
              onChange={handleChange}
              min="0"
              max="999"
              required
            />
          </div>

          <div className="teacher-edit-course-field teacher-edit-course-field--full">
            <label className="teacher-edit-course-label">
              <FileText size={16} />
              <span>Description</span>
            </label>
            <textarea
              className="teacher-edit-course-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu du cours..."
              required
            />
          </div>

          <div className="teacher-edit-course-field teacher-edit-course-field--full">
            <label className="teacher-edit-course-label">
              <ImagePlus size={16} />
              <span>Bannière</span>
            </label>

            <div className="teacher-edit-course-upload">
              {bannerPreview ? (
                <div className="teacher-edit-course-preview-wrap">
                  <img
                    src={bannerPreview}
                    alt="Nouvelle bannière"
                    className="teacher-edit-course-preview"
                  />
                </div>
              ) : currentBannerUrl ? (
                <div className="teacher-edit-course-preview-wrap">
                  <img
                    src={currentBannerUrl}
                    alt="Bannière actuelle"
                    className="teacher-edit-course-preview"
                  />
                </div>
              ) : (
                <div className="teacher-edit-course-upload-placeholder">
                  <UploadCloud size={24} />
                  <span>Aucune bannière actuelle. Ajoutez-en une.</span>
                </div>
              )}

              <input
                className="teacher-edit-course-file"
                type="file"
                name="banniere"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="teacher-edit-course-actions">
          <button
            type="button"
            className="teacher-edit-course-btn teacher-edit-course-btn--danger"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>

          <div className="teacher-edit-course-actions__right">
            <button
              type="button"
              className="teacher-edit-course-btn teacher-edit-course-btn--ghost"
              onClick={() => navigate("/teacher/courses")}
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Annuler</span>
            </button>

            <button
              type="submit"
              className="teacher-edit-course-btn teacher-edit-course-btn--primary"
              disabled={loading}
            >
              <Save size={16} />
              <span>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}