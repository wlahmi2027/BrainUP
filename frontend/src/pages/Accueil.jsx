import { useMemo, useState } from "react";
import {
  Home,
  BookOpen,
  LayoutDashboard,
  Star,
  CheckSquare,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Bookmark,
  Search,
  MoreHorizontal,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import hero from "../assets/hero.png";
import course1 from "../assets/course1.png";
import course2 from "../assets/course2.png";
import course3 from "../assets/course3.png";
import reco1 from "../assets/reco1.png";
import reco2 from "../assets/reco2.png";

const cx = (...c) => c.filter(Boolean).join(" ");

export default function Accueil() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = useMemo(
    () => [
      { label: "Accueil", icon: Home, active: true },
      { label: "Cours", icon: BookOpen },
      { label: "Tableau de Bord", icon: LayoutDashboard },
      { label: "Recommendations", icon: Star },
      { label: "Quiz", icon: CheckSquare },
      { label: "Chatbot", icon: MessageSquare },
      { label: "Profil", icon: User },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#0B3A7A]">
      {/* fond bleu avec dégradés comme l'image */}
      <div className="min-h-screen bg-gradient-to-br from-[#0B3A7A] via-[#0B3A7A] to-[#2C6EEA] p-4 sm:p-6">
        {/* grande carte blanche centrale */}
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-[#F3F7FF] brain-soft ring-1 ring-white/20">
          <div className="flex">
            {/* ================= SIDEBAR DESKTOP ================= */}
            <aside className="hidden w-[270px] flex-col bg-gradient-to-b from-[#0B3A7A] to-[#07305E] text-white md:flex">
              <div className="px-6 pt-7">
                <Brand />
              </div>

              <nav className="mt-8 space-y-1 px-4">
                {nav.map((it) => (
                  <SideItem
                    key={it.label}
                    icon={it.icon}
                    label={it.label}
                    active={it.active}
                  />
                ))}
              </nav>

              <div className="mt-6 px-4">
                <div className="h-px w-full bg-white/15" />
              </div>

              <div className="mt-4 px-4 pb-7">
                <SideItem icon={LogOut} label="Déconnexion" />
              </div>
            </aside>

            {/* ================= SIDEBAR MOBILE (drawer) ================= */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setSidebarOpen(false)}
                />
                <div className="absolute left-0 top-0 h-full w-[290px] bg-gradient-to-b from-[#0B3A7A] to-[#07305E] text-white shadow-2xl">
                  <div className="flex items-center justify-between px-6 pt-7">
                    <Brand />
                    <button
                      className="rounded-xl p-2 hover:bg-white/10"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Fermer"
                    >
                      <X />
                    </button>
                  </div>

                  <nav className="mt-8 space-y-1 px-4">
                    {nav.map((it) => (
                      <SideItem
                        key={it.label}
                        icon={it.icon}
                        label={it.label}
                        active={it.active}
                        onClick={() => setSidebarOpen(false)}
                      />
                    ))}
                  </nav>

                  <div className="mt-6 px-4">
                    <div className="h-px w-full bg-white/15" />
                  </div>

                  <div className="mt-4 px-4 pb-7">
                    <SideItem
                      icon={LogOut}
                      label="Déconnexion"
                      onClick={() => setSidebarOpen(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ================= CONTENU ================= */}
            <main className="flex-1">
              {/* TOPBAR comme l'image */}
              <header className="flex items-center gap-3 bg-[#F7FAFF] px-4 py-4 sm:px-6">
                <button
                  className="rounded-xl bg-white p-2 ring-1 ring-slate-200 hover:bg-slate-50 md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </button>

                {/* search pill */}
                <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-slate-200">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Rechercher un message"
                  />
                </div>

                {/* right actions */}
                <TopRoundIcon icon={Bell} dot />
                <div className="hidden items-center gap-3 rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F0FF] font-extrabold text-[#0B3A7A]">
                    H
                  </div>
                  <div className="text-sm font-bold text-slate-700">
                    Hi, <span className="font-extrabold">Frant</span>
                  </div>
                  <ChevronRight className="h-4 w-4 rotate-90 text-slate-400" />
                </div>
                <TopRoundIcon icon={Bell} />
                <TopRoundIcon icon={Bookmark} />
              </header>

              {/* BODY */}
              <div className="p-4 sm:p-6">
                {/* HERO EXACT FEEL */}
                <section className="brain-card relative overflow-hidden rounded-[22px] bg-white ring-1 ring-slate-100">
                  <div className="grid items-center gap-6 p-6 lg:grid-cols-2">
                    <div className="pl-1">
                      <h1 className="text-[32px] font-extrabold leading-tight text-slate-900 sm:text-[40px]">
                        Bienvenue sur{" "}
                        <span className="text-[#7AC043]">BrainUP</span>!
                      </h1>
                      <p className="mt-2 text-base text-slate-600">
                        Apprenez intelligemment avec nous.
                      </p>
                      <button className="mt-5 rounded-xl bg-[#0B3A7A] px-6 py-3 text-sm font-extrabold text-white shadow hover:opacity-95">
                        Découvrez-nous
                      </button>
                    </div>

                    <div className="relative">
                      {/* halos doux derrière l’illustration */}
                      <div className="absolute -right-8 -top-10 h-56 w-56 rounded-full bg-[#EAF2FF]" />
                      <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-[#DDEBFF]" />
                      <img
                        src={hero}
                        alt="hero"
                        className="relative mx-auto w-full max-w-[560px]"
                      />
                    </div>
                  </div>
                </section>

                {/* rangée cards (comme image) */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  {/* Cours populaires */}
                  <section className="brain-card lg:col-span-2 rounded-[22px] bg-white p-6 ring-1 ring-slate-100">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Cours Populaires
                      </h2>
                      <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#0B3A7A]">
                        Voir Plus <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <CourseCard img={course1} />
                      <CourseCard img={course2} />
                      <CourseCard img={course3} />
                    </div>
                  </section>

                  {/* Recommandé */}
                  <section className="brain-card rounded-[22px] bg-white p-6 ring-1 ring-slate-100">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Recommandé Pour Vous
                      </h2>
                      <button className="rounded-xl p-2 hover:bg-slate-50">
                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      <RecoCard img={reco1} />
                      <RecoCard img={reco2} />
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#EEF4FF] p-4">
                      <div className="h-2 w-full rounded-full bg-white" />
                      <div className="mt-2 h-2 w-2/3 rounded-full bg-white" />
                    </div>
                  </section>

                  {/* Quiz en cours */}
                  <section className="brain-card rounded-[22px] bg-white p-6 ring-1 ring-slate-100">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Quiz en Cours
                    </h2>

                    <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B3A7A] to-[#2C6EEA] p-5 text-white">
                      <div className="text-xl font-extrabold">Quiz JavaScript</div>
                      <div className="mt-1 text-sm opacity-90">
                        20 / 30 questions
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <button className="rounded-xl bg-[#7AC043] px-5 py-2 text-sm font-extrabold text-white hover:opacity-95">
                          Continuer
                        </button>
                        <div className="h-14 w-14 rounded-full bg-white/15" />
                      </div>
                    </div>
                  </section>

                  {/* Progression */}
                  <section className="brain-card rounded-[22px] bg-white p-6 ring-1 ring-slate-100">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      Progression
                    </h2>

                    <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                      <Donut percent={72} />

                      <div className="space-y-2 text-sm">
                        <StatRow label="Cours Suivis" value="5" color="text-[#2C6EEA]" />
                        <StatRow label="Quiz Réussis" value="3" color="text-[#F4B400]" />
                        <StatRow label="Temps d'Étude" value="12h" color="text-[#7AC043]" />
                      </div>
                    </div>
                  </section>

                  {/* Assistant */}
                  <section className="brain-card rounded-[22px] bg-white p-6 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        Assistant Virtuel
                      </h2>
                      <button className="rounded-xl p-2 hover:bg-slate-50">
                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#F3F7FF] p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F0FF] font-extrabold text-[#0B3A7A]">
                        A
                      </div>
                      <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
                        Bonjour! Comment puis-je vous aider?
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <input
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2C6EEA]"
                        placeholder="Écrivez un message..."
                      />
                      <button className="rounded-2xl bg-[#0B3A7A] px-5 py-3 text-sm font-extrabold text-white hover:opacity-95">
                        Envoyer
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== UI ========== */

function Brand() {
  return (
    <div className="flex items-center gap-3">
      {/* si tu veux EXACT le logo, on le remplacera demain par une image */}
      <div className="h-11 w-11 rounded-2xl bg-white/15" />
      <div className="text-[28px] font-extrabold tracking-tight">
        Brain<span className="text-[#7AC043]">UP</span>
      </div>
    </div>
  );
}

function SideItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition",
        active ? "bg-white/15" : "hover:bg-white/10"
      )}
    >
      <Icon className="h-5 w-5 opacity-95" />
      <span>{label}</span>
    </button>
  );
}

function TopRoundIcon({ icon: Icon, dot }) {
  return (
    <button className="relative rounded-full bg-[#EAF2FF] p-3 hover:opacity-90">
      <Icon className="h-5 w-5 text-[#0B3A7A]" />
      {dot && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
      )}
    </button>
  );
}

function CourseCard({ img }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
      <img src={img} alt="course" className="h-[110px] w-full object-cover" />
      <div className="p-3">
        <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B3A7A] px-4 py-2 text-sm font-extrabold text-white hover:opacity-95">
          Voir Plus <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RecoCard({ img }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
      <img src={img} alt="reco" className="h-[100px] w-full object-cover" />
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cx("text-sm font-extrabold", color)}>●</span>
      <span className="text-slate-600">{label} :</span>
      <span className="font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

function Donut({ percent = 72 }) {
  const size = 120;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="#EAF2FF"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="#7AC043"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-extrabold text-slate-900">{percent}%</div>
        <div className="text-sm font-bold text-slate-600">Complété</div>
      </div>
    </div>
  );
}
