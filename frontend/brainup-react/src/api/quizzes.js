import { api } from "./client";

/* =========================
   STUDENT
========================= */

export async function fetchCourseQuizzes(courseId) {
  const token = localStorage.getItem("token");

  const { data } = await api.get(`/courses/${courseId}/quizzes/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function submitStudentQuiz(quizId, payload) {
  const token = localStorage.getItem("token");

  const { data } = await api.post(`/student/quizzes/${quizId}/submit/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function getStudentQuizzes() {
  const token = localStorage.getItem("token");

  const { data } = await api.get("/student/quizzes/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

/* =========================
   TEACHER
========================= */

export async function fetchTeacherQuizzes(teacherId) {
  const token = localStorage.getItem("token");

  const { data } = await api.get(`/quiz/?enseignant=${teacherId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}
export async function fetchTeacherQuizResults(quizId) {
  const token = localStorage.getItem("token");

  const { data } = await api.get(`/teacher/quizzes/${quizId}/results/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function createQuiz(payload) {
  const token = localStorage.getItem("token");

  const { data } = await api.post("/teacher/quizzes/", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function updateQuiz(quizId, payload) {
  const token = localStorage.getItem("token");

  const { data } = await api.put(`/teacher/quizzes/${quizId}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function deleteQuiz(quizId) {
  const token = localStorage.getItem("token");

  const { data } = await api.delete(`/teacher/quizzes/${quizId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}