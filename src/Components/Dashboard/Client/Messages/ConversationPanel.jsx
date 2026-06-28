import React, { Component } from 'react'
import { Search } from "lucide-react";
import "../../../../pages/DashboardPage/Client/ClientMarketplace.css"

export default class ConversationPanel extends Component {
    render() {
        const {
            conversations = [],
            activeConversationId,
            searchQuery = "",
            onSearchChange,
            onSelectConversation,
            loading = false,
        } = this.props;

        return (
            <aside className="conversation-panel">
                <div className="conversation-search">
                    <Search size={18} />
                    <input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange?.(event.target.value)}
                    />
                </div>

                <div className="conversation-list">
                    {loading && <div className="message-state">Loading conversations...</div>}

                    {!loading && conversations.length === 0 && (
                        <div className="message-state">
                            No conversations yet.
                        </div>
                    )}

                    {!loading && conversations.map((item) => (
                        <div
                            className={`conversation-item ${activeConversationId === item.id ? "active" : ""}`}
                            key={item.id}
                            onClick={() => onSelectConversation?.(item)}
                        >
                            <div className="conversation-avatar">
                                {item.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .replace(".", "")
                                    .slice(0, 2)}
                            </div>

                            <div className="conversation-content">
                                <div className="conversation-top">
                                    <strong>{item.name}</strong>
                                    <span>{item.time}</span>
                                </div>

                                <p>{item.role}</p>
                                <small>{item.lastMessage}</small>
                            </div>

                            {item.unread > 0 && <em>{item.unread}</em>}
                        </div>
                    ))}
                </div>
            </aside>
        )
    }
}
