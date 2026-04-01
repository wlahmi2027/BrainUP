import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";
import "../../styles/student/layout.css";

export default function StudentLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => !prev);
  }

  return (
    <div className="student-layout">
      <div className="student-layout__shell">
        <Sidebar
          role="student"
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={closeMobileMenu}
        />

        <div className="student-layout__main">
          <Topbar
            role="student"
            onToggleMobileMenu={toggleMobileMenu}
          />
          <div className="student-layout__content page-search-scope">
            <Outlet />
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          onClick={closeMobileMenu}
          aria-label="Fermer le menu"
        />
      )}
    </div>
  );
}