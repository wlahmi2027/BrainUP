import { api } from "./client";

export async function fetchTeacherStudents() {
  const { data } = await api.get("/teacher/students/");
  return data;
}

export async function fetchStudentResults(studentId) {
  const { data } = await api.get(`/teacher/students/${studentId}/results/`);
  return data;
}

export async function fetchStudentProgress(studentId) {
  const { data } = await api.get(`/teacher/students/${studentId}/progress/`);
  return data;
}