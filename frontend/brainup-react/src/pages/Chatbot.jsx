import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { askBot } from "../api/chatbot";
import "../styles/chatbot.css";

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
    <section className="brainup-chatbot-page">
      <div className="brainup-chatbot-shell">
        <div className="brainup-chatbot-header">
          <div className="brainup-chatbot-header__left">
            <div className="brainup-chatbot-logo">
              <div className="brainup-chatbot-logo__ring" />
              <Bot size={28} />
            </div>

            <div>
              <h1>Assistant BrainUP</h1>
              <p>
                {isTeacher
                  ? "Votre copilote intelligent pour enseigner, organiser et gérer vos contenus."
                  : "Votre assistant pédagogique pour apprendre, trouver vos cours et vous guider."}
              </p>
            </div>
          </div>

          <div className="brainup-chatbot-status">
            <span className="brainup-chatbot-status__dot" />
            En ligne
          </div>
        </div>

        <div className="brainup-chatbot-suggestions">
          {quickSuggestions.map((item, index) => (
            <button
              key={index}
              className="brainup-chatbot-suggestion"
              onClick={() => sendMessage(item)}
              disabled={loading}
              type="button"
            >
              <Sparkles size={15} />
              <span>{item}</span>
            </button>
          ))}
        </div>

        <div className="brainup-chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`brainup-chatbot-row ${
                msg.role === "user"
                  ? "brainup-chatbot-row--user"
                  : "brainup-chatbot-row--assistant"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="brainup-chatbot-avatar brainup-chatbot-avatar--assistant">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`brainup-chatbot-bubble ${
                  msg.role === "user"
                    ? "brainup-chatbot-bubble--user"
                    : "brainup-chatbot-bubble--assistant"
                }`}
              >
                <div className="brainup-chatbot-text">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="brainup-chatbot-links">
                    <div className="brainup-chatbot-links__title">
                      Liens utiles
                    </div>

                    <div className="brainup-chatbot-links__list">
                      {msg.sources.map((src, index) => (
                        <button
                          key={index}
                          type="button"
                          className="brainup-chatbot-linkchip"
                          onClick={() => handleSourceClick(src)}
                          disabled={loading}
                          title={
                            src.route
                              ? `Ouvrir ${src.route}`
                              : `Poser la question : ${src.title}`
                          }
                        >
                          <span className="brainup-chatbot-linkchip__text">
                            {src.title}
                          </span>

                          {src.route ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="brainup-chatbot-actions">
                    {msg.actions.map((action, index) => (
                      <button
                        key={index}
                        type="button"
                        className="brainup-chatbot-action"
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
                <div className="brainup-chatbot-avatar brainup-chatbot-avatar--user">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="brainup-chatbot-row brainup-chatbot-row--assistant">
              <div className="brainup-chatbot-avatar brainup-chatbot-avatar--assistant">
                <Bot size={18} />
              </div>

              <div className="brainup-chatbot-bubble brainup-chatbot-bubble--assistant brainup-chatbot-typing">
                <span className="brainup-chatbot-typing__dot" />
                <span className="brainup-chatbot-typing__dot" />
                <span className="brainup-chatbot-typing__dot" />
                <span className="brainup-chatbot-typing__label">
                  BrainUP réfléchit...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="brainup-chatbot-composer">
          <input
            type="text"
            placeholder={
              isTeacher ? "Posez votre question..." : "Pose ta question..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="brainup-chatbot-input"
            disabled={loading}
          />

          <button
            className="brainup-chatbot-send"
            onClick={() => sendMessage()}
            disabled={loading}
            type="button"
          >
            <Send size={16} />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </section>
  );
}