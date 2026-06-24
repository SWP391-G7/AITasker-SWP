import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getMyJobs, deleteJobPost } from "../../../Services/jobService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

function ClientProjectsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const user = useClientUser();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMyJobs();
      const list =
        result.jobPosts ||
        result.jobs ||
        result.data ||
        result.projects ||
        result.myJobs ||
        [];

      setJobs(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 0);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "No deadline";
    return new Date(dateValue).toLocaleDateString();
  };

  const formatBudget = (job) => {
    const min = job.budget_min ?? job.budgetMin;
    const max = job.budget_max ?? job.budgetMax ?? job.budget;

    if (min && max && min !== max) return `$${min} - $${max}`;
    if (max) return `$${max}`;
    if (min) return `$${min}`;
    return "No budget";
  };

  const handleDelete = async (e, jobId) => {
    e.stopPropagation();

    if (!jobId) {
      setError("Cannot delete this task because job ID is missing.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    try {
      setDeletingId(jobId);
      setError("");

      await deleteJobPost(jobId);
      await fetchJobs();
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    return (
      (job.title || job.jobTitle || "").toLowerCase().includes(query) ||
      (job.required_skill || job.requiredSkill || job.category || job.serviceCategory || "").toLowerCase().includes(query) ||
      (job.status || "open").toLowerCase().includes(query)
    );
  });

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="projects" />

      <main className="post-job-main">
        <ClientHeader
          title="My Projects"
          subtitle="Track all tasks you have posted for AI experts."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="post-form-card">
          <div className="projects-toolbar">
            <div>
              <h2 className="projects-title">Posted Tasks</h2>
              <p className="projects-subtitle">
                {filteredJobs.length} task{filteredJobs.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button className="draft-btn" type="button" onClick={fetchJobs} disabled={loading}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading && <div className="alert alert-success">Loading projects...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="empty-projects">
              <BriefcaseBusiness size={42} />
              <h3>No projects yet</h3>
              <p>You have not posted any tasks. Start by creating a new task.</p>
              <button className="next-btn" type="button" onClick={() => navigate("/client/post-job")}>
                Post a New Task
              </button>
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <div className="project-list">
              {filteredJobs.map((job) => {
                const jobId = job._id || job.id || job.jobId || job.job_id;

                return (
                  <article
                    className="project-card"
                    key={jobId || job.title}
                    onClick={() => (jobId ? navigate(`/client/projects/${jobId}`) : null)}
                  >
                    <div className="project-card-header">
                      <div>
                        <h3>{job.title || job.jobTitle || "Untitled Task"}</h3>
                        <span>
                          {job.required_skill ||
                            job.requiredSkill ||
                            job.category ||
                            job.serviceCategory ||
                            "AI Task"}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <span className="project-status">{job.status || "open"}</span>

                        <button
                          type="button"
                          className="delete-project-btn"
                          disabled={deletingId === jobId}
                          onClick={(e) => handleDelete(e, jobId)}
                        >
                          <Trash2 size={14} />
                          {deletingId === jobId ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="project-description">{job.description || "No description provided."}</p>

                    <div className="project-meta">
                      <span>
                        <DollarSign size={16} />
                        {formatBudget(job)}
                      </span>

                      <span>
                        <CalendarDays size={16} />
                        {formatDate(job.deadline)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientProjectsPage;
