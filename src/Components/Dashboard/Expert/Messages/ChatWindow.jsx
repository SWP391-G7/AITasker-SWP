import React from 'react';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';

const ChatWindow = ({ conversation }) => {
  if (!conversation) {
    return (
      <div className="chat-window-main" style={{ justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window-main">
      <header className="chat-header">
        <div className="chat-user-meta">
          <img src={conversation.avatar} alt={conversation.name} className="chat-avatar" style={{ width: 40, height: 40 }} />
          <div className="header-user-info">
            <h4>{conversation.name}</h4>
          </div>
        </div>
        <div className="header-actions" style={{ gap: '1.25rem' }}>
          <button className="icon-button"><Phone size={18} /></button>
          <button className="icon-button"><Video size={18} /></button>
          <button className="icon-button"><MoreVertical size={18} /></button>
        </div>
      </header>

      <div className="chat-messages-area">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`message-bubble msg-${msg.sender}`}>
            <p>{msg.text}</p>
            <span className="msg-time">{msg.time}</span>
          </div>
        ))}
      </div>

      <footer className="chat-input-footer">
        <div className="chat-input-wrapper">
          <input type="text" placeholder="Type a message..." />
        </div>
        <button className="btn-send-msg">
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;
