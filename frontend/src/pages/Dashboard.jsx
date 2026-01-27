// frontend/src/pages/Dashboard.jsx
// Dashboard BrainUP : design proche de ton screenshot (responsive)

import {
  Home,
  BookOpen,
  LayoutDashboard,
  Sparkles,
  ClipboardList,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Bookmark,
  Search,
  MoreHorizontal,
} from "lucide-react";

// ✅ Images (tu les as déjà dans src/assets)
import hero from "../assets/hero.png";
import course1 from "../assets/course1.png";
import course2 from "../assets/course2.png";
import course3 from "../assets/course3.png";
import reco1 from "../assets/reco1.png";
import reco2 from "../assets/reco2.png";
import quizImg from "../assets/reco.png"; // si tu veux, sinon change par une autre image

export default function Dashboard() {
  return (
    // ✅ Fond bleu + centrage de la "carte" principale
    <div className="min-h-screen bg-gradient-to-br from-[#0B3A7A] via-[#0B3A7A] to-[#2C6EEA] p-4 md:p-8">
      {/* ✅ Conteneur principal */}
      <div className="mx-auto flex min-h-[85vh] max-w-6xl overflow-hidden rounded-3xl bg-white/90 shadow-2xl backdrop-blur">
        {/* ✅ Sidebar */}
        <Sidebar />

        {/* ✅ Zone droite (Topbar + contenu) */}
        <div className="flex flex-1 flex-col">
          <Topbar />

          {/* ✅ Contenu principal */}
          <main className="flex-1 space-y-6 bg-[#F4F8FF] p-4 md:p-6">
            <Hero />

            {/* ✅ Ligne 1 : cours + recommandations */}
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Cours Populaires
                    </h2>
                    <button className="flex items-center gap-1 text-sm font-semibold text-[#0B3A7A] hover:underline">
                      Voir Plus <span>›</span>
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CourseCard img={course1} title="Introduction à Python" />
                    <CourseCard img={course2} title="Machine Learning Avancé" />
                    <CourseCard img={course3} title="Design Web Moderne" />
                  </div>
                </Card>
              </section>

              <section>
                <Card>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Recommandé Pour Vous
                    </h2>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <RecoCard img={reco1} title="Analyse de Données" subtitle="Basé sur vos intérêts" />
                    <RecoCard img={reco2} title="IA et Chatbots" subtitle="Cours suggéré" />
                  </div>
                </Card>
              </section>
            </div>

            {/* ✅ Ligne 2 : quiz + progression + assistant */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <h2 className="text-lg font-extrabold text-slate-900">Quiz en Cours</h2>

                <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B3A7A] to-[#2C6EEA] p-4 text-white">
                  <div className="text-sm opacity-90">Quiz JavaScript</div>
                  <div className="mt-1 text-2xl font-extrabold">20 / 30 questions</div>

                  {/* ✅ Bouton continuer */}
                  <button className="mt-4 w-fit rounded-xl bg-[#76C043] px-5 py-2 text-sm font-extrabold hover:opacity-95">
                    Continuer
                  </button>

                  {/* ✅ Image décorative (optionnel) */}
                  <img
                    src={quizImg}
                    alt="quiz"
                    className="mt-4 w-full rounded-xl opacity-90"
                  />
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-extrabold text-slate-900">Progression</h2>

                <div className="mt-4 flex items-center gap-4">
                  {/* ✅ Cercle (fake chart simple) */}
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full bg-slate-200" />
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "conic-gradient(#3B82F6 72%, #E5E7EB 0)",
                      }}
                    />
                    <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white">
                      <div className="text-lg font-extrabold text-slate-900">
                        72%
                      </div>
                      <div className="text-xs text-slate-500">Complété</div>
                    </div>
                  </div>

                  {/* ✅ Stats */}
                  <div className="space-y-2 text-sm text-slate-700">
                    <Stat label="Cours Suivis" value="5" />
                    <Stat label="Quiz Réussis" value="3" />
                    <Stat label="Temps d'Étude" value="12h" />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Assistant Virtuel
                  </h2>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="h-10 w-10 rounded-full bg-[#0B3A7A]" />
                  <div className="text-sm text-slate-700">
                    Bonjour ! Comment puis-je vous aider ?
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2C6EEA]"
                    placeholder="Écrivez un message..."
                  />
                  <button className="rounded-xl bg-[#0B3A7A] px-4 py-2 text-sm font-extrabold text-white hover:opacity-95">
                    Envoyer
                  </button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* -------------------- COMPONENTS -------------------- */

// ✅ Sidebar
function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col bg-gradient-to-b from-[#0B3A7A] to-[#08305F] p-6 text-white md:flex">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/20" />
        <div className="text-2xl font-extrabold">
          Brain<span className="text-[#76C043]">UP</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="space-y-2 text-sm font-semibold">
        <NavItem icon={<Home size={18} />} label="Accueil" active />
        <NavItem icon={<BookOpen size={18} />} label="Cours" />
        <NavItem icon={<LayoutDashboard size={18} />} label="Tableau de Bord" />
        <NavItem icon={<Sparkles size={18} />} label="Recommandations" />
        <NavItem icon={<ClipboardList size={18} />} label="Quiz" />
        <NavItem icon={<MessageSquare size={18} />} label="Chatbot" />
        <NavItem icon={<User size={18} />} label="Profil" />
      </nav>

      {/* Déconnexion en bas */}
      <div className="mt-auto pt-6">
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-white/90 hover:bg-white/10">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button
      className={[
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left",
        active ? "bg-white/15" : "hover:bg-white/10",
      ].join(" ")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ✅ Topbar
function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/40 bg-white/70 px-4 py-4 backdrop-blur md:px-6">
      {/* Barre recherche */}
      <div className="flex w-full max-w-md items-center gap-2 rounded-2xl bg-[#EEF4FF] px-3 py-2">
        <Search size={18} className="text-slate-500" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
          placeholder="Rechercher un message"
        />
      </div>

      {/* Actions */}
      <div className="hidden items-center gap-3 md:flex">
        <IconBtn>
          <Bell size={18} />
        </IconBtn>
        <div className="flex items-center gap-2 rounded-2xl bg-[#EEF4FF] px-3 py-2 text-sm font-semibold text-slate-700">
          Hi, isen
        </div>
        <IconBtn>
          <Bell size={18} />
        </IconBtn>
        <IconBtn>
          <Bookmark size={18} />
        </IconBtn>
      </div>
    </header>
  );
}

function IconBtn({ children }) {
  return (
    <button className="rounded-2xl bg-[#EEF4FF] p-2 text-slate-600 hover:bg-[#E3ECFF]">
      {children}
    </button>
  );
}

// ✅ Hero
function Hero() {
  return (
    <Card className="relative overflow-hidden">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Bienvenue sur <span className="text-[#76C043]">BrainUP</span>!
          </h1>
          <p className="mt-2 text-slate-600">
            Apprenez intelligemment avec nous.
          </p>

          <button className="mt-5 rounded-2xl bg-[#0B3A7A] px-6 py-3 text-sm font-extrabold text-white hover:opacity-95">
            Découvrez nous
          </button>
        </div>

        {/* Image hero */}
        <div className="relative">
          <img
            src={hero}
            alt="hero"
            className="w-full max-w-md rounded-2xl md:ml-auto"
          />
        </div>
      </div>
    </Card>
  );
}

// ✅ Card générique (pour un style uniforme)
function Card({ children, className = "" }) {
  return (
    <section
      className={[
        "rounded-3xl bg-white p-5 shadow-sm md:p-6",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

// ✅ Carte cours
function CourseCard({ img, title }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <img src={img} alt={title} className="h-28 w-full object-cover" />
      <div className="p-4">
        <div className="font-extrabold text-slate-900">{title}</div>
        <button className="mt-3 w-full rounded-xl bg-[#0B3A7A] px-3 py-2 text-sm font-extrabold text-white hover:opacity-95">
          Voir Plus
        </button>
      </div>
    </div>
  );
}

// ✅ Carte recommandation
function RecoCard({ img, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <img src={img} alt={title} className="h-20 w-24 object-cover" />
      <div className="p-3">
        <div className="font-extrabold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600">{subtitle}</div>
      </div>
    </div>
  );
}

// ✅ Stat simple
function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="text-slate-600">{label}</div>
      <div className="font-extrabold text-slate-900">{value}</div>
    </div>
  );
}
