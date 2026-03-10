import { useState } from "react";

export default function EditCourse() {
  const [form, setForm] = useState({
    title: "React moderne",
    category: "Frontend",
    level: "Intermédiaire",
    description: "Un cours complet pour maîtriser React et ses hooks.",
    status: "Publié",
  });

  const [pdfFile, setPdfFile] = useState(null);

  const existingPdf = {
    name: "react-moderne.pdf",
    url: "#",
  };

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

    console.log("Cours modifié :", {
      ...form,
      newPdf: pdfFile?.name || null,
    });
  }

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Modifier un cours</h1>
          <p className="teacher-subtitle">
            Mettez à jour les informations et le support PDF du cours.
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
            />
          </div>

          <div className="field">
            <label className="label">Catégorie</label>
            <input
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
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
            />
          </div>

          <div className="field teacher-field--full">
            <label className="label">Support PDF actuel</label>

            <div className="teacher-file-actions">
              <div className="teacher-file-box">
                <span>📄 {existingPdf.name}</span>
              </div>

              <a
                className="btn btn--soft"
                href={existingPdf.url}
                download
              >
                Télécharger
              </a>
            </div>
          </div>

          <div className="field teacher-field--full">
            <label className="label">Remplacer le PDF</label>
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
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}