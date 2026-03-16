import { api } from "./client";

/* STUDENT */
export async function fetchCourseQuizzes(courseId) {
  const { data } = await api.get(`/courses/${courseId}/quizzes/`);
  return data;
}

export async function submitQuiz(quizId, payload) {
  const { data } = await api.post(`/student/quizzes/${quizId}/submit/`, payload);
  return data;
}

export async function getStudentQuizzes() {
  const { data } = await api.get("/student/quizzes/");
  return data;
}
/* TEACHER */
export async function fetchTeacherQuizzes() {
  const { data } = await api.get("/teacher/quizzes/");
  return data;
}

export async function createQuiz(payload) {
  const { data } = await api.post("/teacher/quizzes/", payload);
  return data;
}

export async function updateQuiz(quizId, payload) {
  const { data } = await api.put(`/teacher/quizzes/${quizId}/`, payload);
  return data;
}

export async function deleteQuiz(quizId) {
  const { data } = await api.delete(`/teacher/quizzes/${quizId}/`);
  return data;
}

export async function fetchQuizResults(quizId) {
  const { data } = await api.get(`/teacher/quizzes/${quizId}/results/`);
  return data;
}


export function getTeacherQuizzes(teacherId) {
  return request(`/quiz/?enseignant=${teacherId}`);
}
