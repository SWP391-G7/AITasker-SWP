import { Search, Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import "./ClientMarketplace.css";

const conversations = [
  {
    id: 1,
    name: "Dr. Julian V.",
    role: "AI Legal Expert",
    lastMessage: "The validation dataset has been exported successfully.",
    time: "2m",
    active: true,
    unread: 2,
  },
  {
    id: 2,
    name: "Sarah K.",
    role: "Voice AI Specialist",
    lastMessage: "I uploaded the latest sample voice model.",
    time: "18m",
    active: false,
    unread: 0,
  },
  {
    id: 3,
    name: "Nexus Dev Labs",
    role: "Automation Team",
    lastMessage: "Function mapping is currently in progress.",
    time: "1h",
    active: false,
    unread: 1,
  },
  {
    id: 4,
    name: "Marcus T.",
    role: "Data Scientist",
    lastMessage: "The churn model report is ready for review.",
    time: "3h",
    active: false,
    unread: 0,
  },
];

const messages = [
  {
    id: 1,
    sender: "expert",
    text: "Hi Andy, I finished exporting the validation dataset for the legal analysis model.",
    time: "10:24 AM",
  },
  {
    id: 2,
    sender: "client",
    text: "Great. Can you also confirm if the anonymized samples were included?",
    time: "10:26 AM",
  },
  {
    id: 3,
    sender: "expert",
    text: "Yes, all sensitive identifiers were removed. I also attached a short summary of the preprocessing steps.",
    time: "10:28 AM",
  },
  {
    id: 4,
    sender: "client",
    text: "Perfect. I will review the files today and send feedback.",
    time: "10:30 AM",
  },
];

function ClientMessagesPage() {
  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="messages" />

      <main className="messages-main">
        <header className="messages-header">
          <div>
            <h1>Messages</h1>
            <p>Coordinate with experts and track project discussions in one place.</p>
          </div>

          <div className="messages-header-actions">
            <button>New Message</button>
            <span className="market-avatar">A</span>
          </div>
        </header>

        <section className="messages-layout">
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
                  className={`message-row ${
                    message.sender === "client" ? "client" : "expert"
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
        </section>

        <Footer variant="dashboard" />
        {/*
        <footer className="market-footer messages-footer">
          <div>
            <strong>AITasker</strong>
            <p>© 2024 AITasker. All rights reserved.</p>
          </div>

          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Center</span>
            <span>API Documentation</span>
          </div>
        </footer>
        */}
      </main>
    </div>
  );
}

export default ClientMessagesPage;
