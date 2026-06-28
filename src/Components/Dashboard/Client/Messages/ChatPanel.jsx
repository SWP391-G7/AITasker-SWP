import React, { Component } from 'react'
import { MoreVertical, Send } from 'lucide-react'
import '../../../../pages/DashboardPage/Client/ClientMarketplace.css'

export default class ChatPanel extends Component {
  render() {
    const {
      conversation,
      messages = [],
      draftMessage = '',
      onDraftChange,
      onSendMessage,
      loading = false,
      sending = false
    } = this.props

    if (!conversation) {
      return (
        <section className="chat-panel chat-panel-empty">
          <div className="message-state">Select a conversation to start chatting.</div>
        </section>
      )
    }

    const initials = conversation.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .replace('.', '')
      .slice(0, 2)
      .toUpperCase()

    return (
      <section className="chat-panel">
        <div className="chat-header">
          <div className="chat-user">
            <div className="chat-avatar">{initials}</div>

            <div>
              <h2>{conversation.name}</h2>
              <p>{conversation.role}</p>
            </div>
          </div>

          <div className="chat-actions">
            <button type="button" aria-label="More message options">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-date">Today</div>

          {loading && <div className="message-state">Loading messages...</div>}

          {!loading && messages.length === 0 && (
            <div className="message-state">No messages yet. Send the first message to this expert.</div>
          )}

          {!loading && messages.map((message) => (
            <div
              className={`message-row ${message.sender === 'client' ? 'client' : 'expert'}`}
              key={message.id}
            >
              <div className="message-bubble">
                <p>{message.text}</p>
                <span>{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        <form className="chat-input-area" onSubmit={onSendMessage}>
          <input
            placeholder="Write a message..."
            value={draftMessage}
            onChange={(event) => onDraftChange?.(event.target.value)}
            disabled={sending}
          />

          <button className="send-button" type="submit" disabled={sending || !draftMessage.trim()}>
            <Send size={20} />
          </button>
        </form>
      </section>
    )
  }
}
