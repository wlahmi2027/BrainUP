import { useState } from "react";
import { api } from "../api/client"; // adapte le chemin si besoin

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const send = async () => {
    try {
      setReply("...");
      const res = await api.post("/chat/", { message }); // <-- clé "message"
      setReply(res.data?.reply ?? "Aucune réponse");
    } catch (err) {
      console.log("CHAT ERROR:", err);
      console.log("DETAIL:", err?.response?.data);
      setReply("Erreur de connexion au serveur");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>BrainUP Assistant</h1>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écris un message..."
        style={{ width: 360, padding: 8 }}
      />

      <button onClick={send} style={{ marginLeft: 10, padding: "8px 14px" }}>
        Envoyer
      </button>

      <h3 style={{ marginTop: 20 }}>Réponse :</h3>
      <div>{reply}</div>
    </div>
  );
}