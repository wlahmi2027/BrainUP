import { Routes, Route } from "react-router-dom";

/* protection */
import ProtectedRoute from "../components/common/ProtectedRoute";

/* pages publiques */
import Login from "../pages/auth/Login";
import Inscription from "../pages/auth/Inscription";
import Deconnexion from "../pages/Deconnexion";

/* pages globales */
import Accueil from "../pages/Accueil";
import Chatbot from "../pages/Chatbot";

/* layouts */
import StudentLayout from "../pages/student/Layout";
import TeacherLayout from "../pages/teacher/Layout";

/* STUDENT */
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentQuiz from "../pages/student/Quiz";
import StudentRecommendations from "../pages/student/Recommendations";
import StudentProfile from "../pages/student/Profile";

/* TEACHER */
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/Courses";
import TeacherQuiz from "../pages/teacher/Quiz";
import TeacherProfile from "../pages/teacher/Profile";

import CreateCourse from "../pages/teacher/CreateCourse";
import EditCourse from "../pages/teacher/EditCourse";

import CreateQuiz from "../pages/teacher/CreateQuiz";
import EditQuiz from "../pages/teacher/EditQuiz";

/* ADMIN (optionnel plus tard)
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
*/

export default function AppRoutes() {
  return (
    <Routes>

      {/* ========================= */}
      {/* AUTH */}
      {/* ========================= */}

      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/deconnexion" element={<Deconnexion />} />

      {/* ========================= */}
      {/* STUDENT ROUTES */}
      {/* ========================= */}

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />

        <Route path="courses" element={<StudentCourses />} />

        <Route path="quiz" element={<StudentQuiz />} />

        <Route
          path="recommendations"
          element={<StudentRecommendations />}
        />

        <Route path="profile" element={<StudentProfile />} />

        <Route path="chatbot" element={<Chatbot />} />
      </Route>

      {/* ========================= */}
      {/* TEACHER ROUTES */}
      {/* ========================= */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TeacherDashboard />} />

        <Route path="courses" element={<TeacherCourses />} />

        <Route path="courses/create" element={<CreateCourse />} />

        <Route path="courses/:id/edit" element={<EditCourse />} />

        <Route path="quiz" element={<TeacherQuiz />} />

        <Route path="quiz/create" element={<CreateQuiz />} />

        <Route path="quiz/:id/edit" element={<EditQuiz />} />

        <Route path="profile" element={<TeacherProfile />} />

        <Route path="chatbot" element={<Chatbot />} />
      </Route>

      {/* ========================= */}
      {/* PAGE PAR DÉFAUT */}
      {/* ========================= */}

      <Route path="/" element={<Accueil />} />

    </Routes>
  );
}