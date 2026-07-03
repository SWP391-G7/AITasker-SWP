import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ConversationPanel from "../../../Components/Dashboard/Client/Messages/ConversationPanel";
import ChatPanel from "../../../Components/Dashboard/Client/Messages/ChatPanel";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getConversations, getConversationMessages, sendMessage } from "../../../Services/messageService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

function ClientMessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const user = useClientUser();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 1. Fetch conversations list
  useEffect(() => {
    const fetchConvs = async () => {
      try {
        const data = await getConversations();
        setConversations(data);

        // Check if a conversation ID was passed via route state (e.g. from Profile page "Contact")
        const passedId = location.state?.activeConversationId;
        if (passedId) {
          setActiveConversationId(passedId);
        } else if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConvs();

    // Refresh conversations list periodically
    const interval = setInterval(fetchConvs, 10000);
    return () => clearInterval(interval);
  }, [location.state?.activeConversationId]);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const data = await getConversationMessages(activeConversationId);
        setMessages(data);

        // Reset unread count locally
        setConversations(prev => prev.map(c =>
          c.id === activeConversationId ? { ...c, unread: 0 } : c
        ));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds for a responsive chat UI
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversationId]);

  // 3. Handle sending a new message
  const handleSendMessage = async (text) => {
    if (!activeConversationId || !text.trim()) return;
    try {
      const newMsg = await sendMessage(activeConversationId, text);
      setMessages(prev => [...prev, newMsg]);

      // Update last message preview in conversations list
      setConversations(prev => prev.map(c =>
        c.id === activeConversationId
          ? {
            ...c,
            last_message: text,
            last_message_time: new Date().toISOString()
          }
          : c
      ));
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="messages" />

      <main className="messages-main">
        <ClientHeader
          title="Messages"
          subtitle="Coordinate with experts and track project discussions in one place."
          headerActions={
            <div className="messages-header-actions">
              <button type="button" onClick={() => navigate("/clients-experts")}>New Message</button>
            </div>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="messages-layout">
          {loading ? (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
              <p>Loading conversations...</p>
            </div>
          ) : (
            <>
              <ConversationPanel
                conversations={conversations}
                activeId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                searchQuery={searchQuery}
              />
              <ChatPanel
                conversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default ClientMessagesPage;
