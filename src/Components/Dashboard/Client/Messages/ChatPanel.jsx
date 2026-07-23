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

  // Handler “handle send” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;
    shouldScrollAfterSend.current = true;
    await onSendMessage(messageText);
    setInputText("");
  };

  // Handler “handle key down” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Chuyển đổi dữ liệu cho “format message time” thành định dạng mà lớp gọi hoặc giao diện cần.
  const formatMessageTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="chat-panel">
      <div className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {conversation.other_user_avatar_url ? (
              <img src={conversation.other_user_avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>

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
            const currentUserId = currentUser?.id || currentUser?._id;
            const isMe = Boolean(message?.user_id && currentUserId && message.user_id === currentUserId);
            const senderClass = isMe ? "client" : "expert";
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
