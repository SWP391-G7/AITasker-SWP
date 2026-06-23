import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

function ClientSettingsPage() {
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
      <ClientSidebar activeTab="settings" />

      <main className="market-main">
        <ClientHeader
          title="Settings"
          subtitle="This page allows client to update account settings."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="client-settings-panel">
          <h2>Account Preferences</h2>
          <p>Profile, notification, and workspace settings will be managed here.</p>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientSettingsPage;
