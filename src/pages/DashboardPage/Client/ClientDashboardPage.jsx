import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ClientStats from "../../../Components/Dashboard/Client/ClientStats";
import ClientSpendingChart from "../../../Components/Dashboard/Client/ClientSpendingChart";
import ClientActiveProjectsTable from "../../../Components/Dashboard/Client/ClientActiveProjectsTable";
import ClientRecentActivity from "../../../Components/Dashboard/Client/ClientRecentActivity";
import ClientTalentCard from "../../../Components/Dashboard/Client/ClientTalentCard";
import Footer from "../../../Components/Footer/Footer";

import {
  initialClientProjects,
  initialClientActivities,
} from "../../../Components/Dashboard/Client/clientDashboardData";
import { logout } from "../../../Services/authService";

import "../../Style/AdminDashboardPage.css";
import "../../Style/ClientDashboardPage.css";

function ClientDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const user = useClientUser();

  const filteredProjects = initialClientProjects.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="client-dashboard-layout">
      <ClientSidebar />

      <main className="client-main-panel">
        <ClientHeader
          title="Client Overview"
          subtitle="Welcome back. Here is what is happening with your projects today."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <ClientStats
          totalSpent="$24,500.00"
          activeProjects={8}
          pendingProposals={3}
        />

        <section className="client-dashboard-grid">
          <div className="client-left-column">
            <ClientSpendingChart />
            <ClientActiveProjectsTable projects={filteredProjects} />
          </div>

          <div className="client-right-column">
            <ClientRecentActivity activities={initialClientActivities} />
            <ClientTalentCard />
          </div>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientDashboardPage;
