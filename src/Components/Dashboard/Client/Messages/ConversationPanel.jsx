/**
 * Frontend module: Components/Dashboard/Client/Messages/ConversationPanel.jsx
 *
 * Vai trò: Component Conversation Panel: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { useState } from 'react';
import { Search } from "lucide-react";
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css";

// Chuyển đổi dữ liệu cho “format time” thành định dạng mà lớp gọi hoặc giao diện cần.
const formatTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// React component “Conversation Panel” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
export default function ConversationPanel({ conversations = [], activeId, onSelectConversation }) {
  const [filter, setFilter] = useState("");

  const filteredConversations = conversations.filter(c => {
    const name = c.name || c.other_user_name || "";
    const content = c.content || "";
    const lastMsg = c.lastMessage || c.last_message || "";
    const term = filter.toLowerCase();

    return name.toLowerCase().includes(term) ||
      content.toLowerCase().includes(term) ||
      lastMsg.toLowerCase().includes(term);
  });

  return (
    <aside className="chat-list-sidebar">
      <div className="chat-list-header">
        <div className="chat-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="conversations-scroll">
        {filteredConversations.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((item) => {
            const name = item.name || item.other_user_name || "Direct Chat";
            const role = item.role || (
              item.other_user_role === 'expert'
                ? (item.other_user_professional_title || "Expert")
                : (item.other_user_company_name || "Client")
            );
            const avatarUrl = item.avatar || item.other_user_avatar_url;
            const initials = name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .replace(".", "")
              .slice(0, 2)
              .toUpperCase();
            const timeFormatted = formatTime(item.time || item.last_message_time || item.created_at);
            const lastMsg = item.lastMessage || item.last_message || "No messages yet";

            return (
              <div
                className={`conversation-item ${item.id === activeId ? "active" : ""}`}
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="avatar-wrapper">
                  {avatarUrl && !avatarUrl.includes('ui-avatars.com') ? (
                    <img src={avatarUrl} alt={name} className="chat-avatar" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="chat-avatar chat-avatar-initials">{initials}</div>
                  )}
                </div>

                <div className="chat-info">
                  <div className="chat-name-row">
                    <span className="chat-name">{name}</span>
                    <span className="chat-time">{timeFormatted}</span>
                  </div>
                  <p className="chat-role">{role}</p>
                  <div className="chat-name-row">
                    <p className="chat-last-msg">{lastMsg}</p>
                    {item.unread > 0 && <span className="unread-badge">{item.unread}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
