/**
 * Frontend module: Components/Dashboard/Client/Messages/ChatPanel.jsx
 *
 * Vai trò: Component Chat Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical, Paperclip, Send, Trash2 } from "lucide-react";
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css";

// React component “Chat Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function ChatPanel({ conversation, messages = [], onSendMessage, onRemoveMessage }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  const shouldScrollAfterSend = useRef(false);

  let currentUser = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (err) {
    currentUser = {};
  }

  useEffect(() => {
    if (!shouldScrollAfterSend.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    shouldScrollAfterSend.current = false;
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="chat-window-main" style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "#64748b", flex: 1 }}>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const name = conversation.name || conversation.other_user_name || "Direct Chat";
  const role = conversation.role || (
    conversation.other_user_role === 'expert'
      ? (conversation.other_user_professional_title || "Expert")
      : (conversation.other_user_company_name || "Client")
  );
  const avatarUrl = conversation.avatar || conversation.other_user_avatar_url;

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;
    shouldScrollAfterSend.current = true;
    await onSendMessage(messageText);
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
    <div className="chat-window-main">
      <header className="chat-header">
        <div className="chat-user">
          {avatarUrl && !avatarUrl.includes('ui-avatars.com') ? (
            <img src={avatarUrl} alt={name} className="chat-avatar" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="chat-avatar">{initials}</div>
          )}

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
      </header>

      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
            <p>No messages yet. Send a greeting!</p>
          </div>
        ) : (
          messages.map((message) => {
            const currentUserId = currentUser?.id || currentUser?._id;
            const isMe = Boolean(message?.user_id && currentUserId && message.user_id === currentUserId);
            const senderClass = isMe ? "client outgoing" : "expert incoming";
            const isRemoved = Boolean(message.is_removed || message.content === "Message has been removed");

            return (
              <div
                className={`message-row ${senderClass}`}
                key={message.id}
              >
                <div className={`message-bubble-wrapper ${senderClass}`}>
                  {isMe && !isRemoved && onRemoveMessage && (
                    <button
                      type="button"
                      className="message-remove-btn"
                      title="Remove message"
                      onClick={() => onRemoveMessage(message.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className={`message-bubble ${isRemoved ? 'removed' : ''}`}>
                    {isRemoved ? (
                      <p className="removed-text">
                        <Trash2 size={13} style={{ marginRight: '6px', opacity: 0.8, verticalAlign: 'middle' }} />
                        <em>Message has been removed</em>
                      </p>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <span>{formatMessageTime(message.send_at || message.time)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="chat-input-footer">
        <button type="button" className="attach-button">
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          placeholder="Write a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button type="button" className="btn-send-msg" onClick={handleSend}>
          <Send size={20} />
        </button>
      </footer>
    </div>
  );
}
