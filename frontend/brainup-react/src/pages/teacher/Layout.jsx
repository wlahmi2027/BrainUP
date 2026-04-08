import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import "../../styles/teacher/layout.css";

export default function TeacherLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function openMobileMenu() {
    setMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="bg">
      <div className="shell teacher-shell">
        <Sidebar
          role="teacher"
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
        />

        {mobileMenuOpen && (
          <button
            type="button"
            className="app-layout__overlay"
            onClick={closeMobileMenu}
            aria-label="Fermer le menu"
          />
        )}

        <main className="main teacher-main">
          <Topbar role="teacher" onToggleMobileMenu={openMobileMenu} />

          <div className="content teacher-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}