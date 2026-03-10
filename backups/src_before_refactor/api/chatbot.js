import { api } from "./client";

export async function askBot(message, history = []) {
  const { data } = await api.post("/chatbot/chat/", {
    message,
    history,
  });
  return data;
}