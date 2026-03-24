import { api } from "./client";

export async function fetchTeacherStudents(params = {}) {
  const token = localStorage.getItem("token");

  const { data } = await api.get("/teacher/students/", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export async function fetchTeacherStudentDetail(studentId) {
  const token = localStorage.getItem("token");

  const { data } = await api.get(`/teacher/students/${studentId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}