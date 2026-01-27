// frontend/src/pages/Recommandations.jsx
// Cards recommandations

const recos = [
  { title: "Analyse de Données", subtitle: "Basé sur vos intérêts", tone: "green" },
  { title: "IA et Chatbots", subtitle: "Cours suggéré", tone: "blue" },
  { title: "Sécurité Web", subtitle: "Niveau intermédiaire", tone: "blue" },
  { title: "Python Projet", subtitle: "Approche pratique", tone: "green" },
];

export default function Recommandations() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Recommandations</h1>
        <p className="mt-1 text-slate-600">Des contenus sélectionnés pour vous.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recos.map((r) => (
          <Reco key={r.title} {...r} />
        ))}
      </div>
    </div>
  );
}

function Reco({ title, subtitle, tone }) {
  const bg =
    tone === "green"
      ? "bg-gradient-to-r from-[#2E7D32] to-[#66BB6A]"
      : "bg-gradient-to-r from-[#0B3A7A] to-[#2C6EEA]";

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className={`h-24 ${bg}`} />
      <div className="p-5">
        <div className="text-lg font-extrabold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
        <button className="mt-4 w-full rounded-2xl bg-[#0B3A7A] px-4 py-3 text-sm font-extrabold text-white hover:opacity-95">
          Voir
        </button>
      </div>
    </div>
  );
}
