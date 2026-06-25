import { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';

const ChatWindow = ({ conversation, messages = [], onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (!conversation) {
    return (
      <div className="chat-window-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', flex: 1 }}>
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  const formatMessageTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window-main">
      <header className="chat-header">
        <div className="chat-user-meta">
          <img src={conversation.avatar} alt={conversation.name} className="chat-avatar" style={{ width: 40, height: 40 }} />
          <div className="header-user-info">
            <h4>{conversation.name}</h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{conversation.role}</p>
          </div>
        </div>
        <div className="header-actions" style={{ gap: '1.25rem', display: 'flex' }}>
          <button className="icon-button"><Phone size={18} /></button>
          <button className="icon-button"><Video size={18} /></button>
          <button className="icon-button"><MoreVertical size={18} /></button>
        </div>
      </header>

      <div className="chat-messages-area" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            <p>No messages yet. Send a greeting!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUser.id;
            const senderClass = isMe ? 'expert' : 'client';
            
            return (
              <div key={msg.id} className={`message-bubble msg-${senderClass}`}>
                <p style={{ margin: 0 }}>{msg.content}</p>
                <span className="msg-time" style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block', marginTop: '4px', textAlign: 'right' }}>
                  {formatMessageTime(msg.send_at || msg.time)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="chat-input-footer">
        <div className="chat-input-wrapper">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button type="button" className="btn-send-msg" onClick={handleSend}>
          <Send size={18} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;
