import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { askBot } from "../api/chatbot";

export default function Chatbot({ role = "student" }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const isTeacher = role === "teacher";

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: isTeacher
        ? "Bonjour 👋 Je suis Assistant BrainUP. Je peux vous aider à gérer vos cours, vos quiz et votre espace enseignant."
        : "Bonjour 👋 Je suis Assistant BrainUP. Je peux t’aider à trouver un cours, t’orienter vers une page, ou répondre à des questions pédagogiques.",
      sources: [],
      actions: [],
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState(
    isTeacher
      ? [
          "Comment créer un cours ?",
          "Comment ajouter une leçon ?",
          "Combien de cours ai-je ?",
          "Quels sont mes cours ?",
        ]
      : [
          "Je veux apprendre Python",
          "Où trouver les cours ?",
          "Comment modifier mon profil ?",
          "Où sont les quiz ?",
        ]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const goToRoute = (route) => {
    if (!route) return;
    navigate(route);
  };

  const buildHistory = (msgs) =>
    msgs.map((msg) => ({
      role: msg.role,
      content: msg.text,
    }));

  const sendMessage = async (customMessage = null) => {
    const finalMessage = (customMessage ?? message).trim();
    if (!finalMessage || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: finalMessage,
      sources: [],
      actions: [],
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const data = await askBot(finalMessage, buildHistory(nextMessages), role);

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.reply || "Je n’ai pas trouvé de réponse.",
        sources: data.sources || [],
        actions: data.actions || [],
      };

      setMessages((prev) => [...prev, botMessage]);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setQuickSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error(error);

      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Erreur de connexion au serveur.",
        sources: [],
        actions: [],
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

  const handleSourceClick = (src) => {
    if (loading) return;

    if (src.route) {
      goToRoute(src.route);
      return;
    }

    if (src.title) {
      sendMessage(src.title);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-card">
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">🧠</div>
            <div>
              <h2>Assistant BrainUP</h2>
              <p>
                {isTeacher
                  ? "Votre assistant enseignant intelligent"
                  : "Ton assistant pédagogique intelligent"}
              </p>
            </div>
          </div>

          <div className="chatbot-status">
            <span className="status-dot"></span>
            En ligne
          </div>
        </div>

        <div className="chatbot-suggestions">
          {quickSuggestions.map((item, index) => (
            <button
              key={index}
              className="suggestion-chip"
              onClick={() => sendMessage(item)}
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>

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
                  msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-assistant"
                }`}
              >
                <div className="chat-text">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="chat-sources">
                    <div className="chat-sources-title">Liens utiles :</div>

                    <div className="chat-sources-list">
                      {msg.sources.map((src, index) => (
                        <button
                          key={index}
                          type="button"
                          className="chat-source-chip"
                          onClick={() => handleSourceClick(src)}
                          disabled={loading}
                          title={
                            src.route
                              ? `Ouvrir ${src.route}`
                              : `Poser la question : ${src.title}`
                          }
                        >
                          <span className="chat-source-chip-text">
                            {src.title}
                          </span>
                          {src.route && (
                            <span className="chat-source-chip-route">↗</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="chat-actions">
                    {msg.actions.map((action, index) => (
                      <button
                        key={index}
                        type="button"
                        className="chat-action-btn"
                        onClick={() => goToRoute(action.route)}
                        disabled={loading}
                      >
                        {action.label}
                      </button>
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

        <div className="chatbot-input-area">
          <input
            type="text"
            placeholder={
              isTeacher ? "Posez votre question..." : "Pose ta question..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="chatbot-input"
            disabled={loading}
          />

          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={loading}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}