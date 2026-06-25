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

import "../../Style/AdminDashboardPage.css";
import "../../Style/ClientDashboardPage.css";

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

  const getBudgetValue = (job) =>
    Number(job.budget_max ?? job.budgetMax ?? job.budget_min ?? job.budgetMin ?? 0) || 0;

  const mapJobToProject = (job) => ({
    id: job.id || job._id || job.job_id,
    name: job.title || job.jobTitle || "Untitled Task",
    description: job.description || "No description provided.",
    expert: job.expert_name || job.expertName || "Waiting for expert",
    status: job.status || "open",
    budget: formatCurrency(getBudgetValue(job)),
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        // API data: get this client's jobs from GET /api/jobs/my.
        const result = await getMyJobs();
        const jobs = result.jobPosts || result.jobs || result.data || [];
        const mappedProjects = Array.isArray(jobs) ? jobs.map(mapJobToProject) : [];

        setProjects(mappedProjects);
        setActivities(
          mappedProjects.slice(0, 3).map((project) => ({
            id: `activity-${project.id}`,
            title: `${project.name} updated`,
            description: `Current status: ${project.status}`,
            time: "From API",
          }))
        );
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
        setProjects([]);
        setActivities([]);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalSpent = projects.reduce((sum, project) => {
      const amount = Number(String(project.budget).replace(/[^0-9.]/g, ""));
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return {
      totalSpent: formatCurrency(totalSpent),
      activeProjects: projects.filter((project) => project.status !== "completed").length,
      pendingProposals: projects.filter((project) => project.status === "open").length,
    };
  }, [projects]);

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
