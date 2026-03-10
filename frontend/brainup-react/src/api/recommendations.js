import { api } from "./client";

export async function getRecommendations(userId) {
  const { data } = await api.get(`/recommendations/${userId}/`);
  return data;
}