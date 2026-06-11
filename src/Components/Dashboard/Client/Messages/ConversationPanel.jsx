import React, { Component } from 'react'
import { Search } from "lucide-react";
import "../../../../pages/MarketplacePage/Client/ClientMarketplace.css"
import { conversations } from "./Conversations";

export default class ConversationPanel extends Component {
    render() {
        return (
            <aside className="conversation-panel">
                <div className="conversation-search">
                    <Search size={18} />
                    <input placeholder="Search conversations..." />
                </div>

                <div className="conversation-list">
                    {conversations.map((item) => (
                        <div
                            className={`conversation-item ${item.active ? "active" : ""}`}
                            key={item.id}
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
