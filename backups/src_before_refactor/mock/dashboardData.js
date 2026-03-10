export const dashboardData = {
  user: { name: "Frant", initial: "H" },

  progress: {
    percent: 72,
    objectifsLabel: "Cette semaine",
    checklist: [
      { text: "Cours terminés cette semaine", value: "2" },
      { text: "Notes et progrès collectés", value: "2" },
      { text: "Révisions et tests terminés", value: "+200" },
      { text: "Rapport envoyé", value: "filtre de l’étudiant" },
    ],
  },

  statsCards: [
    { kpi: "8657", name: "Quiz JavaScript", ctaLeft: "📌 Favoris", ctaRight: "S'inscrire" },
    { kpi: "ML & Chatbots", name: "Cours IA & Chatbots", ctaLeft: "📄 Détails", ctaRight: "Voir activité" },
  ],

  suggestions: [
    { icon: "🧠", title: "Algorithmique et Structures de Données" },
    { icon: "💻", title: "HTML & CSS" },
    { icon: "🗄️", title: "Base de Données" },
  ],

  topQuiz: [
    { icon: "🏆", name: "Les Algorithmes", period: "Semaine", score: "177/100", label: "Record" },
    { icon: "🐍", name: "Python", period: "Semaine", score: "4/10", label: "Score" },
  ],
};