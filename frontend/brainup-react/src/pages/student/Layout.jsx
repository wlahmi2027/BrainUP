import { Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";

export default function StudentLayout() {
  return (
    <div className="bg">
      <div className="shell">
        <Sidebar />
        <main className="main">
          <Topbar />
          <div className="content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}