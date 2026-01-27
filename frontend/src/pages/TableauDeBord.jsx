// frontend/src/pages/TableauDeBord.jsx
// Dashboard stats + widgets (responsive)

export default function TableauDeBord() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Tableau de Bord</h1>
        <p className="mt-1 text-slate-600">Vue globale de votre apprentissage.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Cours suivis" value="5" />
        <Stat title="Quiz réussis" value="3" />
        <Stat title="Temps d’étude" value="12h" />
        <Stat title="Streak" value="4 jours" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Progression</h2>
          <div className="mt-4 h-3 w-full rounded-full bg-slate-100">
            <div className="h-3 w-[72%] rounded-full bg-[#0B3A7A]" />
          </div>
          <p className="mt-2 text-sm text-slate-600">72% complété</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MiniCard title="Dernier cours" value="React pour débutants" />
            <MiniCard title="Dernier quiz" value="JavaScript" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">À faire aujourd’hui</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-slate-50 p-4">Terminer 1 leçon Python</li>
            <li className="rounded-2xl bg-slate-50 p-4">Faire le quiz “SQL”</li>
            <li className="rounded-2xl bg-slate-50 p-4">Demander au chatbot un résumé</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-600">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-1 font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
