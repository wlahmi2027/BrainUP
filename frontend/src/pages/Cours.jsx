// frontend/src/pages/Cours.jsx
// Liste de cours en cards (responsive)

const courses = [
  { title: "Introduction à Python", level: "Débutant", minutes: 120 },
  { title: "Machine Learning Avancé", level: "Avancé", minutes: 240 },
  { title: "Design Web Moderne", level: "Intermédiaire", minutes: 180 },
  { title: "Bases de SQL", level: "Débutant", minutes: 90 },
  { title: "React pour débutants", level: "Débutant", minutes: 150 },
  { title: "API Node/Express", level: "Intermédiaire", minutes: 160 },
];

export default function Cours() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Cours</h1>
        <p className="mt-1 text-slate-600">Explorez vos cours et continuez votre progression.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div key={c.title} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="h-24 rounded-2xl bg-gradient-to-r from-[#0B3A7A] to-[#2C6EEA]" />
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">{c.title}</h3>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span>{c.level}</span>
              <span>{c.minutes} min</span>
            </div>
            <button className="mt-4 w-full rounded-2xl bg-[#0B3A7A] px-4 py-3 text-sm font-extrabold text-white hover:opacity-95">
              Voir le cours
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
