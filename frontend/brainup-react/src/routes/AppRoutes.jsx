import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Login from "../pages/auth/Login";
import Inscription from "../pages/auth/Inscription";
import Deconnexion from "../pages/Deconnexion";
import Chatbot from "../pages/Chatbot";
import Home from "../pages/public/Home";

/* Student */
import StudentLayout from "../pages/student/Layout";
import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentCourseDetail from "../pages/student/CourseDetail";
import StudentQuiz from "../pages/student/Quiz";
import StudentRecommendations from "../pages/student/Recommendations";
import StudentProfile from "../pages/student/Profile";
import StudentQuizDetails from "../pages/student/StudentQuizDetails";

/* Teacher */
import TeacherLayout from "../pages/teacher/Layout";
import TeacherDashboard from "../pages/teacher/Dashboard";
import TeacherCourses from "../pages/teacher/Courses";
import TeacherCourseDetail from "../pages/teacher/CourseDetail";
import TeacherQuiz from "../pages/teacher/Quiz";
import TeacherProfile from "../pages/teacher/Profile";
import CreateCourse from "../pages/teacher/CreateCourse";
import EditCourse from "../pages/teacher/EditCourse";
import CreateQuiz from "../pages/teacher/CreateQuiz";
import EditQuiz from "../pages/teacher/EditQuiz";
import Students from "../pages/teacher/Students";
import StudentDetail from "../pages/teacher/StudentDetail";
import QuizDetails from "../pages/teacher/QuizDetails";
import QuizResults from "../pages/teacher/QuizResults";
import TeacherQuizResultDetails from "../pages/teacher/TeacherQuizResultDetails";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/deconnexion" element={<Deconnexion />} />

      {/* Student routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="accueil" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="courses/:id" element={<StudentCourseDetail />} />
          <Route path="quiz" element={<StudentQuiz />} />
          <Route path="recommendations" element={<StudentRecommendations />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="chatbot" element={<Chatbot role="student" />} />
          <Route path="quiz/:id" element={<StudentQuizDetails />} />
        </Route>
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="accueil" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/:id" element={<TeacherCourseDetail />} />
          <Route path="courses/create" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<EditCourse />} />
          <Route path="quiz" element={<TeacherQuiz />} />
          <Route path="quiz/create" element={<CreateQuiz />} />
          <Route path="quiz/:id" element={<QuizDetails />} />
          <Route path="quiz/:id/edit" element={<EditQuiz />} />
          <Route path="quiz/:id/results" element={<QuizResults />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="chatbot" element={<Chatbot role="teacher" />} />
          <Route
            path="quiz/:quizId/results"
            element={<TeacherQuizResultDetails />}
          />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}