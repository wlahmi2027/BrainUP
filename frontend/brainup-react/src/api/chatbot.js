import { api } from "./client";

export async function askBot(message, history = [], role = "student") {
  const { data } = await api.post("/chatbot/chat/", {
    message,
    history,
    role,
  });

  return data;
}