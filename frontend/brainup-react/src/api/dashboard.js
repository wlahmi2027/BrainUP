import { api } from "./client";

/* STUDENT */
export async function fetchStudentDashboard() {
  const token = localStorage.getItem("token");

  const { data } = await api.get("/student/dashboard/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}

/* TEACHER */
export async function fetchTeacherDashboard() {
  const token = localStorage.getItem("token");

  const { data } = await api.get("/teacher/dashboard/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}