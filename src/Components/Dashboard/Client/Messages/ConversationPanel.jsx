import { useState } from 'react';
import { Search } from "lucide-react";
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css";

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

export default function ConversationPanel({ conversations = [], activeId, onSelectConversation }) {
  const [filter, setFilter] = useState("");

  const filteredConversations = conversations.filter(c => {
    const name = c.other_user_name || "";
    const content = c.content || "";
    const lastMsg = c.last_message || "";
    const term = filter.toLowerCase();

    return name.toLowerCase().includes(term) ||
      content.toLowerCase().includes(term) ||
      lastMsg.toLowerCase().includes(term);
  });

  return (
    <aside className="conversation-panel">
      <div className="conversation-search">
        <Search size={18} />
        <input
          placeholder="Search conversations..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="conversation-list">
        {filteredConversations.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((item) => {
            const name = item.other_user_name || "Direct Chat";
            const role = item.other_user_role === 'expert'
              ? (item.other_user_professional_title || "Expert")
              : (item.other_user_company_name || "Client");
            const initials = name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .replace(".", "")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                className={`conversation-item ${item.id === activeId ? "active" : ""}`}
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="conversation-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.other_user_avatar_url ? (
                    <img src={item.other_user_avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>

                <div className="conversation-content">
                  <div className="conversation-top">
                    <strong>{name}</strong>
                    <span>{formatTime(item.last_message_time || item.created_at)}</span>
                  </div>

                  <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#64748b" }}>{role}</p>
                  <small style={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px"
                  }}>
                    {item.last_message || "No messages yet"}
                  </small>
                </div>

                {item.unread > 0 && <em>{item.unread}</em>}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
