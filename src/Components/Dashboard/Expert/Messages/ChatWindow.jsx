import { useEffect, useRef, useState } from 'react';
import { Send, MoreVertical, Phone, Video, Paperclip, Trash2 } from 'lucide-react';

const ChatWindow = ({ conversation, messages = [], onSendMessage, onRemoveMessage }) => {
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

  const initials = conversation.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="chat-window-main">
      <header className="chat-header">
        <div className="chat-user">
          <div className="chat-avatar">{initials}</div>

          <div>
            <h2>{conversation.name}</h2>
            <p>{conversation.role}</p>
          </div>
        </div>

        <div className="chat-actions">
          <button type="button"><Phone size={18} /></button>
          <button type="button"><Video size={18} /></button>
          <button type="button"><MoreVertical size={18} /></button>
        </div>
      </header>

      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            <p>No messages yet. Send a greeting!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const currentUserId = currentUser?.id || currentUser?._id;
            const isMe = Boolean(msg?.user_id && currentUserId && msg.user_id === currentUserId);
            const senderClass = isMe ? 'expert' : 'client';
            const isRemoved = Boolean(msg.is_removed || msg.content === "Message has been removed");

            return (
              <div key={msg.id} className={`message-row ${senderClass}`}>
                <div className={`message-bubble-wrapper ${senderClass}`}>
                  {isMe && !isRemoved && onRemoveMessage && (
                    <button
                      type="button"
                      className="message-remove-btn"
                      title="Remove message"
                      onClick={() => onRemoveMessage(msg.id)}
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
                      <p>{msg.content}</p>
                    )}
                    <span>{formatMessageTime(msg.send_at || msg.time)}</span>
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
};

export default ChatWindow;
