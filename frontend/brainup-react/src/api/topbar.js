import { api } from "./client";

export async function fetchTopbarData() {
  const token = localStorage.getItem("token");

  const { data } = await api.get("/topbar/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
}