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

const formatBudget = (job) => {
  const min = job.budget_min ?? job.budgetMin;
  const max = job.budget_max ?? job.budgetMax ?? job.budget;

  if (min && max && min !== max) return `$${min} - $${max}`;
  if (max) return `$${max}`;
  if (min) return `$${min}`;
  return "No budget";
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

  const fetchJobsAndProjects = async () => {
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
      setError(err.message || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndProjects();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobs.filter((job) =>
      (job.title || "").toLowerCase().includes(query) ||
      (job.required_skill || "").toLowerCase().includes(query) ||
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
      await fetchJobsAndProjects();
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
          title="My Workspace"
          subtitle="Manage all your job posts and active project contracts."
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="post-form-card" style={{ maxWidth: '100%', width: '100%' }}>
          <div className="projects-toolbar" style={{ marginBottom: '20px' }}>
            <div>
              <h2 className="projects-title" style={{ fontSize: '1.4rem' }}>Dashboard Overview</h2>
              <p className="projects-subtitle">
                Found {filteredJobs.length} job post{filteredJobs.length !== 1 ? "s" : ""} and {filteredProjects.length} project contract{filteredProjects.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button className="draft-btn" type="button" onClick={fetchJobsAndProjects} disabled={loading}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading && <div className="alert alert-success">Loading items...</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <div className="split-tables-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="split-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
                
                {/* Left Table: Job Posts */}
                <div className="table-wrapper-card" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseBusiness size={20} className="text-primary" />
                    My Job Posts
                  </h3>
                  
                  {filteredJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>No job posts found.</p>
                      <button className="next-btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} type="button" onClick={() => navigate("/client/post-job")}>
                        Post a New Task
                      </button>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '12px 8px' }}>Title</th>
                            <th style={{ padding: '12px 8px' }}>Budget</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredJobs.map((job) => {
                            const jobId = getJobId(job);
                            return (
                              <tr 
                                key={jobId || job.title} 
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => jobId && navigate(`/client/projects/${jobId}`)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: '500' }}>{job.title || "Untitled"}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{formatBudget(job)}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span className={`project-status ${job.status === 'pending' ? 'pending-status' : ''}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                    {job.status || 'open'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="delete-project-btn"
                                    style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                    disabled={deletingId === jobId}
                                    onClick={(event) => handleDelete(event, jobId)}
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Table: Hired Projects */}
                <div className="table-wrapper-card" style={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BriefcaseBusiness size={20} className="text-success" />
                    My Hired Projects
                  </h3>
                  
                  {filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No project contracts found.</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>Approve a proposal to start a project.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '12px 8px' }}>Title</th>
                            <th style={{ padding: '12px 8px' }}>Budget</th>
                            <th style={{ padding: '12px 8px' }}>Expert</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProjects.map((project) => {
                            return (
                              <tr 
                                key={project.id} 
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => navigate(`/projects/${project.id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <td style={{ padding: '12px 8px', color: '#fff', fontWeight: '500' }}>{project.title || "Untitled Project"}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>${parseFloat(project.total_amount).toLocaleString()}</td>
                                <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{project.expert_name || "AI Expert"}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span className={`project-status ${
                                    project.status === 'completed' ? 'accepted-status' : project.status === 'terminated' ? 'rejected-status' : 'active-status'
                                  }`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                                    {project.status || 'active'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientProjectsPage;
