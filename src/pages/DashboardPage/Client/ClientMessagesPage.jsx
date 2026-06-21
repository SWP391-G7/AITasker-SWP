import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ConversationPanel from "../../../Components/Dashboard/Client/Messages/ConversationPanel";
import ChatPanel from "../../../Components/Dashboard/Client/Messages/ChatPanel";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";


function ClientMessagesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const user = useClientUser();

  const handleLogout = () => {
    logout();
    navigate("/");
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
              <button type="button">New Message</button>
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
          <ConversationPanel />
          <ChatPanel />
        </section>

      </main>
    </div>
  );
}

export default ClientMessagesPage;
