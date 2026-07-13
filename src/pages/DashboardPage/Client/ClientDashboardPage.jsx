import { useEffect, useMemo, useState } from "react";
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

import { logout } from "../../../Services/authService";
import { getMyJobs } from "../../../Services/jobService";
import { getMyProjects } from "../../../Services/projectService";
import { getMyTransactionsAPI } from "../../../Services/transactionService";

import "../Style/AdminDashboardPage.css";
import "../Style/ClientDashboardPage.css";

function ClientDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");
  const user = useClientUser();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  const [stats, setStats] = useState({
    totalSpent: "$0.00",
    activeProjects: 0,
    pendingProposals: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        // API data: load jobs, projects, and transaction stats in parallel
        const [jobsResult, projectsResult, transactionsResult] = await Promise.all([
          getMyJobs(),
          getMyProjects(),
          getMyTransactionsAPI().catch(() => ({ success: false, stats: null }))
        ]);

        // 1. Map projects (contracts)
        const apiProjects = Array.isArray(projectsResult) ? projectsResult : [];
        const mappedProjects = apiProjects.map((proj) => ({
          id: proj.id,
          name: proj.title || "Untitled Project",
          description: proj.description || "No description provided.",
          expert: proj.expert_name || "Expert",
          status: proj.status || "active",
          budget: formatCurrency(proj.total_amount),
        }));
        setProjects(mappedProjects);

        // 2. Map financial stats and job counts
        const totalSpentVal = transactionsResult?.success && transactionsResult?.stats?.totalLifetime
          ? transactionsResult.stats.totalLifetime
          : 0;

        const apiJobs = Array.isArray(jobsResult?.jobPosts || jobsResult?.jobs || jobsResult)
          ? (jobsResult.jobPosts || jobsResult.jobs || jobsResult)
          : [];

        setStats({
          totalSpent: formatCurrency(totalSpentVal),
          activeProjects: apiProjects.filter((p) => p.status !== 'completed' && p.status !== 'terminated').length,
          pendingProposals: apiJobs.filter((j) => j.status === 'open' || j.status === 'pending').length,
        });

        // 3. Map activities
        const projectActivities = mappedProjects.slice(0, 2).map((p) => ({
          id: `act-proj-${p.id}`,
          title: `Project "${p.name}" status updated`,
          description: `Current status is ${p.status}.`,
          time: "Recent",
        }));

        const jobActivities = apiJobs.slice(0, 2).map((j) => ({
          id: `act-job-${j.id}`,
          title: `Job post "${j.title || "Untitled"}" active`,
          description: `Status: ${j.status || "open"}.`,
          time: j.created_at ? new Date(j.created_at).toLocaleDateString() : "Just now",
        }));

        setActivities([...projectActivities, ...jobActivities]);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
        setProjects([]);
        setActivities([]);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredProjects = projects.filter(
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
          totalSpent={stats.totalSpent}
          activeProjects={stats.activeProjects}
          pendingProposals={stats.pendingProposals}
        />

        {error && <div className="alert alert-danger">{error}</div>}

        <section className="client-dashboard-grid">
          <div className="client-left-column">
            <ClientSpendingChart />
            <ClientActiveProjectsTable projects={filteredProjects} />
          </div>

          <div className="client-right-column">
            <ClientRecentActivity activities={activities} />
            <ClientTalentCard />
          </div>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientDashboardPage;

