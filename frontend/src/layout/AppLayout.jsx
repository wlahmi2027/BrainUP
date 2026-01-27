// frontend/src/layout/AppLayout.jsx
import { useState } from "react";
import Accueil from "../pages/Accueil";

import {
  Home,
  BookOpen,
  LayoutDashboard,
  Star,
  CheckSquare,
  MessageCircle,
  User,
  LogOut,
  Menu,
  Bell,
  Search,
} from "lucide-react";

/**
 * ✅ Layout principal (Sidebar + Topbar + Content)
 * - Desktop: sidebar fixe à gauche
 * - Mobile: sidebar en "drawer" (menu hamburger)
 */
export default function AppLayout() {
  const [open, setOpen] = useState(false);

  // ✅ liens du menu (icône + label)
  const nav = [
    { label: "Accueil", icon: Home },
    { label: "Cours", icon: BookOpen },
    { label: "Tableau de Bord", icon: LayoutDashboard },
    { label: "Recommandations", icon: Star },
    { label: "Quiz", icon: CheckSquare },
    { label: "Chatbot", icon: MessageCircle },
    { label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3A7A] via-[#0B3A7A] to-[#2C6EEA]">
      <div className="mx-auto flex min-h-screen max-w-[1400px] p-4 md:p-6">
        {/* ✅ Sidebar desktop */}
        <aside className="hidden w-[260px] shrink-0 rounded-3xl bg-white/10 p-5 text-white shadow-xl backdrop-blur md:block">
          <Brand />

          <nav className="mt-8 space-y-2">
            {nav.map((item) => (
              <NavItem key={item.label} icon={item.icon} label={item.label} />
            ))}

            <div className="my-4 h-px bg-white/20" />

            <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-white/90 hover:bg-white/10">
              <LogOut className="h-5 w-5" />
              <span className="font-semibold">Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* ✅ Drawer mobile */}
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-[280px] bg-[#0B3A7A] p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  className="rounded-xl p-2 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="mt-8 space-y-2">
                {nav.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setOpen(false)}
                  />
                ))}

                <div className="my-4 h-px bg-white/20" />

                <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-white/90 hover:bg-white/10">
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">Déconnexion</span>
                </button>
              </nav>
            </aside>
          </div>
        )}

        {/* ✅ Zone centrale */}
        <div className="flex min-w-0 flex-1 flex-col rounded-3xl bg-[#F4F7FF] shadow-2xl">
          {/* Topbar */}
          <header className="flex items-center gap-3 rounded-t-3xl bg-white/70 px-4 py-4 backdrop-blur md:px-6">
            {/* Hamburger mobile */}
            <button
              className="rounded-2xl p-2 hover:bg-black/5 md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Rechercher un message"
              />
            </div>

            {/* Actions */}
            <button className="hidden rounded-2xl p-3 hover:bg-black/5 md:inline-flex">
              <Bell className="h-5 w-5 text-slate-700" />
            </button>

            <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 md:flex">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0B3A7A] to-[#2C6EEA]" />
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-800">Hi, isen</div>
                <div className="text-xs text-slate-500">Étudiant</div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="min-w-0 flex-1 p-4 md:p-6">
            <Accueil />
          </main>
        </div>
      </div>
    </div>
  );
}

/** ✅ Logo / Nom */
function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-white/20" />
      <div className="text-2xl font-extrabold tracking-tight">
        Brain<span className="text-[#B7FF4A]">UP</span>
      </div>
    </div>
  );
}

/** ✅ Élément de menu */
function NavItem({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-white/90 hover:bg-white/10"
    >
      <Icon className="h-5 w-5" />
      <span className="font-semibold">{label}</span>
    </button>
  );
}
