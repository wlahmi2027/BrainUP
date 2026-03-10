import { useState } from "react";

export default function CreateCourse() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    level: "Débutant",
    description: "",
    status: "Brouillon",
  });

  const [pdfFile, setPdfFile] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (file && file.type !== "application/pdf") {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    setPdfFile(file);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("level", form.level);
    formData.append("description", form.description);
    formData.append("status", form.status);

    if (pdfFile) {
      formData.append("pdf", pdfFile);
    }

    console.log("Cours à envoyer :", {
      ...form,
      pdfFileName: pdfFile?.name || null,
    });

    // Plus tard :
    // await api.post("/teacher/courses/", formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Créer un cours</h1>
          <p className="teacher-subtitle">
            Ajoutez un nouveau cours et son support PDF.
          </p>
        </div>
      </div>

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
              <option>Débutant</option>
              <option>Intermédiaire</option>
              <option>Avancé</option>
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
              <option>Brouillon</option>
              <option>Publié</option>
            </select>
          </div>

          <div className="field teacher-field--full">
            <label className="label">Description</label>
            <textarea
              className="teacher-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu du cours..."
            />
          </div>

          <div className="field teacher-field--full">
            <label className="label">Support de cours (PDF)</label>
            <input
              className="input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            {pdfFile && (
              <div className="teacher-file-box">
                <span>📄 {pdfFile.name}</span>
                <span className="teacher-file-box__meta">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="teacher-form-actions">
          <button type="button" className="btn btn--ghost">
            Annuler
          </button>
          <button type="submit" className="btn btn--primary">
            Enregistrer le cours
          </button>
        </div>
      </form>
    </section>
  );
}