import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ConversationPanel from "../../../Components/Dashboard/Client/Messages/ConversationPanel";
import ChatPanel from "../../../Components/Dashboard/Client/Messages/ChatPanel";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getStoredUser } from "../../../Services/checkLogin";
import { search as searchApi } from "../../../Services/searchService";
import {
  createConversation,
  getConversationMessages,
  getConversations,
  sendMessage,
} from "../../../Services/messageService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

const formatMessageTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const mapConversation = (conversation) => ({
  id: conversation.id,
  otherUserId: conversation.other_user_id,
  name:
    conversation.other_user_name ||
    conversation.target_name ||
    conversation.other_user_email ||
    "AI Expert",
  role:
    conversation.other_user_professional_title ||
    conversation.professional_title ||
    (conversation.other_user_role === "expert" ? "AI Expert" : "Client"),
  lastMessage: conversation.last_message || "No messages yet",
  time: formatConversationTime(conversation.last_message_time || conversation.created_at),
  unread: Number(conversation.unread || 0),
});

const mapMessage = (message, currentUserId) => ({
  id: message.id,
  text: message.content || "",
  time: formatMessageTime(message.send_at),
  sender: message.user_id === currentUserId ? "client" : "expert",
});

const mapExpert = (expert) => ({
  id: expert.id,
  name: expert.full_name || "Unnamed Expert",
  role: expert.professional_title || "AI Expert",
  bio: expert.bio || "Available for AI project discussions.",
});

function ClientMessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [notifications, setNotifications] = useState(2);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [startingConversation, setStartingConversation] = useState(false);
  const [error, setError] = useState("");
  const user = useClientUser();
  const storedUser = getStoredUser();
  const currentUserId = storedUser?.id || storedUser?._id || user?.id || user?._id;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const refreshConversations = async (preferredConversationId = null) => {
    const result = await getConversations();
    const mappedConversations = (result.data || []).map(mapConversation);

    setConversations(mappedConversations);

    if (preferredConversationId) {
      const preferred = mappedConversations.find(
        (conversation) => conversation.id === preferredConversationId
      );
      setActiveConversation(preferred || mappedConversations[0] || null);
      return;
    }

    setActiveConversation((current) => {
      if (!current) return mappedConversations[0] || null;
      return mappedConversations.find((item) => item.id === current.id) || mappedConversations[0] || null;
    });
  };

  useEffect(() => {
    let ignore = false;

    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        setError("");

        const result = await getConversations();
        const mappedConversations = (result.data || []).map(mapConversation);

        if (!ignore) {
          setConversations(mappedConversations);
          setActiveConversation((current) => current || mappedConversations[0] || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load conversations.");
        }
      } finally {
        if (!ignore) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }

    let ignore = false;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");

        const result = await getConversationMessages(activeConversation.id);
        const mappedMessages = (result.data || []).map((message) =>
          mapMessage(message, currentUserId)
        );

        if (!ignore) {
          setMessages(mappedMessages);
          setConversations((items) =>
            items.map((item) =>
              item.id === activeConversation.id ? { ...item, unread: 0 } : item
            )
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load messages.");
        }
      } finally {
        if (!ignore) {
          setLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [activeConversation?.id, currentUserId]);

  const filteredConversations = useMemo(() => {
    const keyword = conversationSearch.trim().toLowerCase();

    if (!keyword) return conversations;

    return conversations.filter((conversation) =>
      [conversation.name, conversation.role, conversation.lastMessage]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [conversationSearch, conversations]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setDraftMessage("");
  };

  const handleOpenNewMessage = async () => {
    try {
      setShowNewMessage(true);
      setLoadingExperts(true);
      setError("");

      const result = await searchApi({ target: "expert" });
      setExperts((result.results || []).map(mapExpert));
    } catch (err) {
      setError(err.message || "Failed to load experts.");
      setExperts([]);
    } finally {
      setLoadingExperts(false);
    }
  };

  const handleStartConversation = async (expert) => {
    try {
      setStartingConversation(true);
      setError("");

      const result = await createConversation(expert.id);
      const conversationId = result.data?.id;

      await refreshConversations(conversationId);
      setShowNewMessage(false);
      setDraftMessage("");
    } catch (err) {
      setError(err.message || "Failed to start conversation.");
    } finally {
      setStartingConversation(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const content = draftMessage.trim();
    if (!activeConversation?.id || !content) return;

    try {
      setSendingMessage(true);
      setError("");

      const result = await sendMessage({
        conversationId: activeConversation.id,
        content,
      });
      const newMessage = mapMessage(result.data, currentUserId);

      setMessages((items) => [...items, newMessage]);
      setDraftMessage("");
      setConversations((items) =>
        items.map((item) =>
          item.id === activeConversation.id
            ? {
                ...item,
                lastMessage: content,
                time: formatConversationTime(result.data?.send_at),
              }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="messages" />

      <main className="messages-main">
        <ClientHeader
          title="Messages"
          subtitle="Coordinate with experts and track project discussions in one place."
          headerActions={
            <div className="messages-header-actions">
              <button type="button" onClick={handleOpenNewMessage}>New Message</button>
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
          <ConversationPanel
            conversations={filteredConversations}
            activeConversationId={activeConversation?.id}
            searchQuery={conversationSearch}
            onSearchChange={setConversationSearch}
            onSelectConversation={handleSelectConversation}
            loading={loadingConversations}
          />
          <ChatPanel
            conversation={activeConversation}
            messages={messages}
            draftMessage={draftMessage}
            onDraftChange={setDraftMessage}
            onSendMessage={handleSendMessage}
            loading={loadingMessages}
            sending={sendingMessage}
          />
        </section>

        {error && <div className="messages-error">{error}</div>}

        {showNewMessage && (
          <div className="message-modal-backdrop">
            <div className="message-modal">
              <div className="message-modal-header">
                <div>
                  <h2>New Message</h2>
                  <p>Choose an expert to start a conversation.</p>
                </div>
                <button type="button" onClick={() => setShowNewMessage(false)}>Close</button>
              </div>

              <div className="message-expert-list">
                {loadingExperts && <div className="message-state">Loading experts...</div>}

                {!loadingExperts && experts.length === 0 && (
                  <div className="message-state">No experts found.</div>
                )}

                {!loadingExperts && experts.map((expert) => (
                  <button
                    className="message-expert-item"
                    key={expert.id}
                    type="button"
                    onClick={() => handleStartConversation(expert)}
                    disabled={startingConversation}
                  >
                    <span className="conversation-avatar">
                      {expert.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span>
                      <strong>{expert.name}</strong>
                      <small>{expert.role}</small>
                      <em>{expert.bio}</em>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientMessagesPage;
