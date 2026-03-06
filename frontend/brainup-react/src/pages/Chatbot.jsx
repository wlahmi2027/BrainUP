import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Bonjour 👋 Je suis Assistant BrainUP. Je peux t’aider à trouver un cours, t’orienter vers une page, ou répondre à des questions pédagogiques.",
      sources: [],
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const quickSuggestions = [
    "Je veux apprendre Python",
    "Où trouver les cours ?",
    "Comment modifier mon profil ?",
    "Où sont les quiz ?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (customMessage = null) => {
    const finalMessage = (customMessage ?? message).trim();
    if (!finalMessage || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: finalMessage,
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/chat/", { message: finalMessage });

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: res.data.reply || "Je n’ai pas trouvé de réponse.",
        sources: res.data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Erreur de connexion au serveur.",
        sources: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-card">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">🧠</div>
            <div>
              <h2>Assistant BrainUP</h2>
              <p>Ton assistant pédagogique intelligent</p>
            </div>
          </div>

          <div className="chatbot-status">
            <span className="status-dot"></span>
            En ligne
          </div>
        </div>

        {/* Suggestions */}
        <div className="chatbot-suggestions">
          {quickSuggestions.map((item, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => sendMessage(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-row ${
                msg.role === "user" ? "chat-row-user" : "chat-row-assistant"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="message-avatar assistant-avatar">🧠</div>
              )}

              <div
                className={`chat-bubble ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
                }`}
              >
                <div className="chat-text">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="chat-sources">
                    <div className="chat-sources-title">Sources :</div>
                    {msg.sources.map((src, index) => (
                      <div key={index} className="chat-source-item">
                        <strong>{src.title}</strong>
                        {src.route && <span> → {src.route}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="message-avatar user-avatar">👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-row chat-row-assistant">
              <div className="message-avatar assistant-avatar">🧠</div>
              <div className="chat-bubble chat-bubble-assistant typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-label">BrainUP réfléchit...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            type="text"
            placeholder="Pose ta question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="chatbot-input"
          />

          <button className="chatbot-send-btn" onClick={() => sendMessage()}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}