import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="bg">
      <div className="shell">
        <Sidebar />
        <main className="main">
          <Topbar />
          <section className="content">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}