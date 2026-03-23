import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "debutant",
    description: "",
    status: "brouillon",
    temps_apprentissage: "0",
    banniere: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    
    
    if (form.banniere) {
      formData.append("banniere", form.banniere);
    }


    try {
      setLoading(true);
      const res = await fetch("http://localhost:8001/api/courses/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // no Content-Type here — browser sets it automatically with FormData boundary
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
        throw new Error(data?.message || "Erreur lors de la création du cours.");
      }

      navigate("/teacher/courses");
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
          <h1 className="page__title">Créer un cours</h1>
          <p className="teacher-subtitle">Ajoutez un nouveau cours</p>
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
            <div className="field">
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
              placeholder="Ex. 30"
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
          <input
            type="file"
            name="banniere"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="teacher-form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate("/teacher/courses")}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer le cours"}
          </button>
        </div>
      </form>
    </section>
  );
}