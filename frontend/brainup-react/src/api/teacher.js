import { api } from "./client";

export async function fetchTeacherResults() {
  const { data } = await api.get("/teacher/results/");
  return data;
}

export async function fetchStudentsResults() {
  const { data } = await api.get("/teacher/students-results/");
  return data;
}