import axios from "axios";

export const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://127.0.0.1:8001/api"
=======
  baseURL: "http://127.0.0.1:8000/api", // change si votre backend a une autre URL
>>>>>>> b26b8a0cde1e21d41d99f81e61c9ee407ae3a67c
});
// Ajouter automatiquement le token si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export async function login(email, password) {
  const response = await fetch("http://localhost:8000/api/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}