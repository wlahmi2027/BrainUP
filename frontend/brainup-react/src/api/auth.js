import { api } from "./client";

export async function loginUser(email, password) {
  const { data } = await api.post("/login/", {
    email,
    mot_de_passe: password,
  });
  return data;
}

export async function registerUser(payload) {
  const { data } = await api.post("/register/", payload);
  return data;
}

export async function getProfile() {
  const { data } = await api.get("/user/profile/");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put("/user/profile/", payload);
  return data;
}