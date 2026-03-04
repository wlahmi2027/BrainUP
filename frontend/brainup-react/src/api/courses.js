import { api } from "./client";

// GET liste des cours
export const fetchCourses = async () => {
  const res = await api.get("/courses/"); // backend: /api/courses/
  return res.data;
};

// POST/PUT rating
export const rateCourse = async (courseId, rating) => {
  // backend possible: POST /api/courses/:id/rate/
  const res = await api.post(`/courses/${courseId}/rate/`, { rating });
  return res.data;
};

// Favori
export const toggleFavorite = async (courseId) => {
  // backend possible: POST /api/courses/:id/favorite/
  const res = await api.post(`/courses/${courseId}/favorite/`);
  return res.data;
};