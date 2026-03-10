import { api } from "./client";

export async function fetchCourses() {
  const { data } = await api.get("/courses/");
  return data;
}

export async function fetchCourseById(courseId) {
  const { data } = await api.get(`/courses/${courseId}/`);
  return data;
}

export async function createCourse(formData) {
  const { data } = await api.post("/teacher/courses/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function updateCourse(courseId, formData) {
  const { data } = await api.put(`/teacher/courses/${courseId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function deleteCourse(courseId) {
  const { data } = await api.delete(`/teacher/courses/${courseId}/`);
  return data;
}

export async function fetchTeacherCourses() {
  const { data } = await api.get("/teacher/courses/");
  return data;
}