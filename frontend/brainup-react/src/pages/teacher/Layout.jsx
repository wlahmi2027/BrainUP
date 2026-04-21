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
    <div className="teacher-layout">
      <div className="teacher-layout__shell">
        <Sidebar
          role="teacher"
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
        />

        <main className="teacher-layout__main">
          <Topbar role="teacher" onToggleMobileMenu={openMobileMenu} />

          <div className="teacher-layout__content">
            <Outlet />
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          className="teacher-layout__overlay"
          onClick={closeMobileMenu}
          aria-label="Fermer le menu"
        />
      )}
    </div>
  );
}