import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      const res = await fetch(`http://localhost:8001/api/admin/courses/${id}/`, {
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

      // Redirect to course list after deletion
      navigate("/admin/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch course data on mount
  useEffect(() => {
    async function fetchCourse() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:8001/api/admin/courses/${id}/`, {
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
          banniere: null, // never prefill file input
        });

        setCurrentBannerUrl(data.banniere || null);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchCourse();
  }, [id, navigate]);

  function handleChange(event) {
    const { name, value, files } = event.target;
    if (name === "banniere") {
      setForm((prev) => ({ ...prev, banniere: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
      const res = await fetch(`http://localhost:8001/api/admin/courses/${id}/`, {
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

      navigate("/admin/courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Modifier le cours</h1>
          <p className="teacher-subtitle">Mettez à jour les informations du cours</p>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form className="teacher-form-card" onSubmit={handleSubmit}>
        <div className="teacher-form-grid">
          <div className="field">
            <label className="label">Titre du cours</label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex. Introduction à Django"
              required
            />
          </div>

          <div className="field">
            <label className="label">Catégorie</label>
            <input
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Ex. Backend"
            />
          </div>

          <div className="field">
            <label className="label">Niveau</label>
            <select
              className="input"
              name="level"
              value={form.level}
              onChange={handleChange}
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Statut</label>
            <select
              className="input"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="brouillon">Brouillon</option>
              <option value="publie">Publié</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Temps d’apprentissage (heures)</label>
            <input
              className="input"
              type="number"
              name="temps_apprentissage"
              value={form.temps_apprentissage}
              onChange={handleChange}
              min="0"
              max="999"
              required
            />
          </div>

          <div className="field teacher-field--full">
            <label className="label">Description</label>
            <textarea
              className="teacher-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu du cours..."
              required
            />
          </div>
        </div>

        <div className="field teacher-field--full">
          <label className="label">Bannière</label>
          {currentBannerUrl && (
            <img
              src={currentBannerUrl}
              alt="Bannière actuelle"
              style={{ width: "200px", marginBottom: "10px" }}
            />
          )}
          <input
            type="file"
            name="banniere"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="teacher-form-actions">
          <button
            type="button"
            className="btnDanger"
            onClick={handleDelete}
            disabled={loading}
            style={{ marginRight: "auto" }}
          >
            Supprimer le cours
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/admin/courses")}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </section>
  );
}