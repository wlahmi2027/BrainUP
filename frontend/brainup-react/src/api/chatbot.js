import { api } from "./client";

/**
 * Appel backend (quand il sera prêt)
 * Attendu: POST /api/chat/  body: { message: "..." }
 * Réponse attendue: { reply: "...", actions?: [...] }
 */
export async function askBot(message) {
  const { data } = await api.post("/chatbot/chat/", { message });
  return data; // ex: { reply: "..." }
}