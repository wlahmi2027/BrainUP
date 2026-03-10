import { useMemo, useState } from "react";

export default function Students() {
  const [query, setQuery] = useState("");

  const students = useMemo(
    () => [
      {
        id: 1,
        name: "Amine K.",
        email: "amine@email.com",
        course: "React moderne",
        progress: 78,
        status: "Actif",
      },
      {
        id: 2,
        name: "Sarah B.",
        email: "sarah@email.com",
        course: "Python avancé",
        progress: 55,
        status: "Actif",
      },
      {
        id: 3,
        name: "Nour D.",
        email: "nour@email.com",
        course: "Bases de données",
        progress: 91,
        status: "Excellent",
      },
      {
        id: 4,
        name: "Yassine M.",
        email: "yassine@email.com",
        course: "React moderne",
        progress: 34,
        status: "À relancer",
      },
    ],
    []
  );

  const filteredStudents = useMemo(() => {
    if (!query.trim()) return students;

    const q = query.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.course.toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <section className="page teacher-page">
      <div className="teacher-head">
        <div>
          <h1 className="page__title">Étudiants inscrits</h1>
          <p className="teacher-subtitle">
            Suivez vos apprenants par cours et progression.
          </p>
        </div>
      </div>

      <div className="teacher-toolbar">
        <div className="searchInline">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un étudiant..."
          />
        </div>
      </div>

      <div className="teacher-students-table">
        <div className="teacher-students-table__head">
          <span>Étudiant</span>
          <span>Cours</span>
          <span>Progression</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>

        {filteredStudents.map((student) => (
          <div key={student.id} className="teacher-students-table__row">
            <div className="teacher-student-user">
              <div className="teacher-student-avatar">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="teacher-row__title">{student.name}</div>
                <div className="teacher-row__meta">{student.email}</div>
              </div>
            </div>

            <div className="teacher-student-course">{student.course}</div>

            <div className="teacher-student-progress">
              <div className="teacher-progress-bar">
                <div
                  className="teacher-progress-bar__fill"
                  style={{ width: `${student.progress}%` }}
                />
              </div>
              <span>{student.progress}%</span>
            </div>

            <div>
              <span
                className={`teacher-badge ${
                  student.status === "Excellent"
                    ? "teacher-badge--success"
                    : student.status === "À relancer"
                    ? "teacher-badge--warn"
                    : "teacher-badge--muted"
                }`}
              >
                {student.status}
              </span>
            </div>

            <div className="teacher-student-actions">
              <button className="btn btn--ghost">Voir profil</button>
              <button className="btn btn--soft">Résultats</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}