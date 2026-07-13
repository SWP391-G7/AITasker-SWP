import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ConversationPanel from "../../../Components/Dashboard/Client/Messages/ConversationPanel";
import ChatPanel from "../../../Components/Dashboard/Client/Messages/ChatPanel";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getConversations, getConversationMessages, sendMessage } from "../../../Services/messageService";
import useWebSocket from "../../../hooks/useWebSocket";
import "../Style/AdminDashboardPage.css";
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
  const fetchConvs = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      return data;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const data = await fetchConvs();
      const passedId = location.state?.activeConversationId;
      if (passedId) {
        setActiveConversationId(passedId);
      } else if (data.length > 0) {
        setActiveConversationId(data[0].id);
      }
    };
    init();
  }, [fetchConvs, location.state?.activeConversationId]);

  // Periodic poll for conversation list
  useEffect(() => {
    const interval = setInterval(fetchConvs, 10000);
    return () => clearInterval(interval);
  }, [fetchConvs]);

  // 2. Fetch messages when active conversation changes (only on change)
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
  }, [activeConversationId]);

  // 3. Set up WebSocket listener
  useWebSocket((data) => {
    if (data.type === 'new_message') {
      const { conversationId, message } = data;

      // If it belongs to active conversation, append it
      if (conversationId === activeConversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Update last message preview in list
        setConversations(prev => prev.map(c =>
          c.id === conversationId
            ? { ...c, last_message: message.content, last_message_time: message.send_at, unread: 0 }
            : c
        ));
      } else {
        // Increment unread count for other conversation
        setConversations(prev => {
          const exists = prev.some(c => c.id === conversationId);
          if (!exists) {
            // Reload list to fetch new conversation if it's not present
            fetchConvs();
            return prev;
          }
          return prev.map(c =>
            c.id === conversationId
              ? { ...c, last_message: message.content, last_message_time: message.send_at, unread: (c.unread || 0) + 1 }
              : c
          );
        });
      }
    }
  });

  // 4. Handle sending a new message
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

