import React, { Component } from 'react'
import { Phone, Video, MoreVertical, Paperclip, Send } from "lucide-react";
import "../../../../pages/MarketplacePage/Client/ClientMarketplace.css"
import { messages } from "./Messages";

export default class ChatPanel extends Component {
    render() {
        return (
            <section className="chat-panel">
                <div className="chat-header">
                    <div className="chat-user">
                        <div className="chat-avatar">JV</div>

                        <div>
                            <h2>Dr. Julian V.</h2>
                            <p>Online · Enterprise LLM Fine-tuning</p>
                        </div>
                    </div>

                    <div className="chat-actions">
                        <button>
                            <Phone size={18} />
                        </button>
                        <button>
                            <Video size={18} />
                        </button>
                        <button>
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>

                <div className="chat-body">
                    <div className="chat-date">Today</div>

                    {messages.map((message) => (
                        <div
                            className={`message-row ${message.sender === "client" ? "client" : "expert"
                                }`}
                            key={message.id}
                        >
                            <div className="message-bubble">
                                <p>{message.text}</p>
                                <span>{message.time}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input-area">
                    <button>
                        <Paperclip size={20} />
                    </button>

                    <input placeholder="Write a message..." />

                    <button className="send-button">
                        <Send size={20} />
                    </button>
                </div>
            </section>
        )
    }
}
