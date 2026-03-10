import { api } from "./client";

/* STUDENT */
export async function fetchStudentDashboard() {
  const { data } = await api.get("/student/dashboard/");
  return data;
}

/* TEACHER */
export async function fetchTeacherDashboard() {
  const { data } = await api.get("/teacher/dashboard/");
  return data;
}

/* ADMIN */
/*
export async function fetchAdminDashboard() {
  const { data } = await api.get("/admin/dashboard/");
  return data;
}*/
