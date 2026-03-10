import { api } from "./client";

export async function fetchCourses() {
  const { data } = await api.get("/courses/");
  return data;
}