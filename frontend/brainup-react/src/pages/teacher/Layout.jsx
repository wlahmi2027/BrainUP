import { Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Topbar from "../../components/common/Topbar";

export default function TeacherLayout() {
  return (
    <div className="bg">
      <div className="shell">
        <Sidebar role="teacher" />

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