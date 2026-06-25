import { useState, useEffect, useRef } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send } from "lucide-react";
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css";

export default function ChatPanel({ conversation, messages = [], onSendMessage }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <section className="chat-panel" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#64748b" }}>
        <p>Select a conversation to start chatting</p>
      </section>
    );
  }

  const name = conversation.other_user_name || "Direct Chat";
  const role = conversation.other_user_role === 'expert' 
    ? (conversation.other_user_professional_title || "Expert") 
    : (conversation.other_user_company_name || "Client");
  
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatMessageTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="chat-panel">
      <div className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar">{initials}</div>

          <div>
            <h2>{name}</h2>
            <p>{role}</p>
          </div>
        </div>

        <div className="chat-actions">
          <button type="button">
            <Phone size={18} />
          </button>
          <button type="button">
            <Video size={18} />
          </button>
          <button type="button">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="chat-body">
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
            <p>No messages yet. Send a greeting!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.user_id === currentUser.id;
            const senderClass = isMe ? "client" : "expert";
            
            return (
              <div
                className={`message-row ${senderClass}`}
                key={message.id}
              >
                <div className="message-bubble">
                  <p>{message.content}</p>
                  <span>{formatMessageTime(message.send_at || message.time)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <button type="button">
          <Paperclip size={20} />
        </button>

        <input 
          placeholder="Write a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button type="button" className="send-button" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </section>
  );
}
