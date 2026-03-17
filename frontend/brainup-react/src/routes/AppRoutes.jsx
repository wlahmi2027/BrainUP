import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Login from "../pages/auth/Login";
import Inscription from "../pages/auth/Inscription";
import Deconnexion from "../pages/Deconnexion";
import Chatbot from "../pages/Chatbot";
import Accueil from "../pages/Accueil";

/* Student */
import StudentLayout from "../pages/student/Layout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentCourseDetail from "../pages/student/CourseDetail";
import StudentQuiz from "../pages/student/Quiz";
import StudentRecommendations from "../pages/student/Recommendations";
import StudentProfile from "../pages/student/Profile";

/* Teacher */
import TeacherLayout from "../pages/teacher/Layout";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/Courses";
import TeacherQuiz from "../pages/teacher/Quiz";
import TeacherProfile from "../pages/teacher/Profile";
import CreateCourse from "../pages/teacher/CreateCourse";
import EditCourse from "../pages/teacher/EditCourse";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import EditQuiz from "../pages/teacher/EditQuiz";
import Results from "../pages/teacher/Results";
import Students from "../pages/teacher/Students";
import StudentsResults from "../pages/teacher/StudentsResults";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/deconnexion" element={<Deconnexion />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="accueil" element={<Accueil />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<StudentCourseDetail />} />
          <Route path="quiz" element={<StudentQuiz />} />
          <Route path="recommendations" element={<StudentRecommendations />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="chatbot" element={<Chatbot />} />
        </Route>
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="quiz" element={<TeacherQuiz />} />
          <Route path="quiz/create" element={<CreateQuiz />} />
          <Route path="quiz/:id/edit" element={<EditQuiz />} />
          <Route path="results" element={<Results />} />
          <Route path="students" element={<Students />} />
          <Route path="students-results" element={<StudentsResults />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="chatbot" element={<Chatbot />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}