import axios from "axios";

const API_URL = "http://127.0.0.1:8001/api";

export async function getRecommendations(userId) {
  const token = localStorage.getItem("token");

  const { data } = await axios.get(
    `${API_URL}/recommendations/${userId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}