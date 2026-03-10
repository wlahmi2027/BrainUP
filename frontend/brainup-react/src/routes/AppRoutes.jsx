import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";

import Accueil from "../pages/Accueil";
import Chatbot from "../pages/Chatbot";
import Deconnexion from "../pages/Deconnexion";

import Login from "../pages/auth/Login";
import Inscription from "../pages/auth/Inscription";

import StudentLayout from "../pages/student/Layout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentQuiz from "../pages/student/Quiz";
import StudentRecommendations from "../pages/student/Recommendations";
import StudentProfile from "../pages/student/Profile";

/*
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/Courses";
import TeacherQuiz from "../pages/teacher/Quiz";
import TeacherProfile from "../pages/teacher/Profile";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
*/
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Accueil />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/quiz" element={<StudentQuiz />} />
        <Route
          path="/student/recommendations"
          element={<StudentRecommendations />}
        />
        <Route path="/student/profile" element={<StudentProfile />} />

        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/deconnexion" element={<Deconnexion />} />
    

      </Route>
    </Routes>
  );
}

/*        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/quiz" element={<TeacherQuiz />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />*/