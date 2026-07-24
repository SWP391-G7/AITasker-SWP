import { useState } from 'react';
import { Search } from 'lucide-react';

const ChatList = ({ conversations = [], activeId, onSelect }) => {
  const [filter, setFilter] = useState('');

  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(filter.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(filter.toLowerCase()))
  );

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .replace('.', '')
      .slice(0, 2)
      .toUpperCase() || 'C';

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
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            <p>No messages found</p>
          </div>
        ) : (
          filteredConversations.map((chat) => (
            <div 
              key={chat.id} 
              className={`conversation-item ${activeId === chat.id ? 'active' : ''}`}
              onClick={() => onSelect(chat.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar-wrapper">
                <div className="chat-avatar chat-avatar-initials">
                  {getInitials(chat.name)}
                </div>
              </div>
              
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">{chat.time}</span>
                </div>
                <p className="chat-role">{chat.role}</p>
                <div className="chat-name-row">
                  <p className="chat-last-msg">{chat.lastMessage}</p>
                  {chat.unread > 0 && <span className="unread-badge">{chat.unread}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ChatList;
