import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error?.response || error?.message || error);
    return Promise.reject(error);
  }
);