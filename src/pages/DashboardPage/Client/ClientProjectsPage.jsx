import { useEffect, useMemo, useState } from "react";
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
import { getMyProjects } from "../../../Services/projectService";
import "../../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

const getJobId = (job) => job?._id || job?.id || job?.jobId || job?.job_id;

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

const getProgress = (item) => {
  if (typeof item.progress === "number") return item.progress;
  if (item.status === "completed") return 100;
  return 0;
};

function ClientProjectsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const user = useClientUser();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [jobsResult, projectsResult] = await Promise.all([
        getMyJobs(),
        getMyProjects()
      ]);
      const list = jobsResult.jobPosts || jobsResult.jobs || jobsResult.data || jobsResult.projects || jobsResult.myJobs || [];
      setJobs(Array.isArray(list) ? list : []);
      setProjects(Array.isArray(projectsResult) ? projectsResult : []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobs.filter((job) =>
      (job.title || job.jobTitle || "").toLowerCase().includes(query) ||
      (job.required_skill || job.requiredSkill || job.category || job.serviceCategory || "").toLowerCase().includes(query) ||
      (job.status || "open").toLowerCase().includes(query)
    );
  }, [jobs, searchQuery]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return projects.filter((project) =>
      (project.title || "").toLowerCase().includes(query) ||
      (project.expert_name || "").toLowerCase().includes(query) ||
      (project.status || "active").toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleDelete = async (event, jobId) => {
    event.stopPropagation();

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
      await fetchDashboardData();
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

        <div className="projects-toolbar" style={{ marginBottom: '24px' }}>
          <div>
            <h2 className="projects-title" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: 0 }}>Workspace Dashboard</h2>
            <p className="projects-subtitle" style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>Manage your tasks and active contracts.</p>
          </div>

          <button className="draft-btn" type="button" onClick={fetchDashboardData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: '24px' }}>{error}</div>}
        {loading && <div className="alert alert-success" style={{ marginBottom: '24px' }}>Loading workspace details...</div>}

        {!loading && !error && (
          <div className="dashboard-split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: POSTED TASKS (JOB POSTS) */}
            <div className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Posted Tasks</h3>
                <span className="project-status" style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px' }}>{filteredJobs.length} Posts</span>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-projects" style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <BriefcaseBusiness size={42} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
                  <h4 style={{ color: '#fff', marginBottom: '8px' }}>No Tasks Posted</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px' }}>You haven't posted any job tasks yet.</p>
                  <button className="next-btn" type="button" onClick={() => navigate("/client/post-job")} style={{ cursor: 'pointer' }}>
                    Post a New Task
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredJobs.map((job) => {
                    const jobId = getJobId(job);
                    return (
                      <div
                        key={jobId || job.title}
                        onClick={() => jobId && navigate(`/client/projects/${jobId}`)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{job.title || "Untitled"}</h4>
                          <span 
                            className={`project-status ${job.status === 'pending' ? 'pending-status' : ''}`} 
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '3px 8px', 
                              borderRadius: '4px',
                              ...(job.status === 'removed' ? { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' } : {})
                            }}
                          >
                            {job.status === 'removed' ? 'Removed' : (job.status || "open")}
                          </span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {job.description || "No description provided."}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                          <span>Budget: {formatBudget(job)}</span>
                          {job.status !== 'closed' && job.status !== 'pending' && (
                            <button
                              type="button"
                              className="delete-project-btn"
                              disabled={deletingId === jobId}
                              onClick={(event) => handleDelete(event, jobId)}
                              style={{ border: 'none', background: 'transparent', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                            >
                              <Trash2 size={12} />
                              {deletingId === jobId ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: CONTRACTED PROJECTS */}
            <div className="post-form-card" style={{ background: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>Contracted Projects</h3>
                <span className="project-status accepted-status" style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px' }}>{filteredProjects.length} Active</span>
              </div>

              {filteredProjects.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <BriefcaseBusiness size={42} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <h4>No Contracts Yet</h4>
                  <p style={{ fontSize: '0.9rem' }}>When you approve an expert's proposal, active contracts will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{project.title || "Project Contract"}</h4>
                        <span className={`project-status ${project.status}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                          {project.status}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {project.description || "No description provided."}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                        <span>Expert: <strong>{project.expert_name || "AI Expert"}</strong></span>
                        <span>Amount: <strong>${project.total_amount}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientProjectsPage;
