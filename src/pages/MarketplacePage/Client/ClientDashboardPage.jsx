import { useState } from "react";

import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import ClientStats from "../../../Components/Dashboard/Client/ClientStats";
import ClientSpendingChart from "../../../Components/Dashboard/Client/ClientSpendingChart";
import ClientActiveProjectsTable from "../../../Components/Dashboard/Client/ClientActiveProjectsTable";
import ClientRecentActivity from "../../../Components/Dashboard/Client/ClientRecentActivity";
import ClientTalentCard from "../../../Components/Dashboard/Client/ClientTalentCard";
import ClientDashboardFooter from "../../../Components/Dashboard/Client/ClientDashboardFooter";

import {
  initialClientProjects,
  initialClientActivities,
} from "../../../Components/Dashboard/Client/clientDashboardData";

import "../../Style/AdminDashboardPage.css";
import "../../Style/ClientDashboardPage.css";

function ClientDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);

  const filteredProjects = initialClientProjects.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expert.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="client-dashboard-layout">
      <ClientSidebar />

      <main className="client-main-panel">
        <ClientHeader
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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

        <ClientDashboardFooter />
      </main>
    </div>
  );
}

export default ClientDashboardPage;
