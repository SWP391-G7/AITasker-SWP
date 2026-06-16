import React from 'react';
import { Search } from 'lucide-react';

const ChatList = ({ conversations, activeId, onSelect }) => {
  return (
    <aside className="chat-list-sidebar">
      <div className="chat-list-header">
        <div className="chat-search-box">
          <Search size={16} />
          <input type="text" placeholder="Search messages..." />
        </div>
      </div>

      <div className="conversations-scroll">
        {conversations.map((chat) => (
          <div 
            key={chat.id} 
            className={`conversation-item ${activeId === chat.id ? 'active' : ''}`}
            onClick={() => onSelect(chat.id)}
          >
            <div className="avatar-wrapper">
              <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
              <span className={`status-dot status-${chat.status}`}></span>
            </div>
            
            <div className="chat-info">
              <div className="chat-name-row">
                <span className="chat-name">{chat.name}</span>
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-name-row">
                <p className="chat-last-msg">{chat.lastMessage}</p>
                {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ChatList;
