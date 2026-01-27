// frontend/src/pages/Quiz.jsx
// Liste de quiz + carte quiz en cours

const quizzes = [
  { title: "JavaScript", questions: 30, done: 20 },
  { title: "SQL", questions: 20, done: 0 },
  { title: "Python", questions: 25, done: 12 },
];

export default function Quiz() {
  const current = quizzes[0];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Quiz</h1>
        <p className="mt-1 text-slate-600">Entraînez-vous et suivez vos scores.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {quizzes.map((q) => (
            <div key={q.title} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="text-lg font-extrabold text-slate-900">Quiz {q.title}</div>
              <div className="mt-2 text-sm text-slate-600">
                {q.done} / {q.questions} questions
              </div>
              <button className="mt-4 w-full rounded-2xl bg-[#0B3A7A] px-4 py-3 text-sm font-extrabold text-white hover:opacity-95">
                Commencer
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Quiz en cours</h2>
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-[#0B3A7A] to-[#2C6EEA] p-5 text-white">
            <div className="text-sm opacity-90">Quiz {current.title}</div>
            <div className="mt-2 text-sm opacity-90">
              {current.done} / {current.questions} questions
            </div>
            <button className="mt-5 rounded-xl bg-[#35C26B] px-4 py-2 text-sm font-extrabold hover:opacity-95">
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
