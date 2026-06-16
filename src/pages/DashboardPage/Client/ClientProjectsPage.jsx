import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  PlusCircle,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import { getMyJobs, deleteJobPost } from "../../../services/jobService";
import "./ClientMarketplace.css";

function ClientProjectsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMyJobs();

      const list =
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
    fetchJobs();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "No deadline";
    return new Date(dateValue).toLocaleDateString();
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

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="projects" />

      <main className="post-job-main">
        <header className="post-job-header">
          <div>
            <h1>My Projects</h1>
            <p>Track all tasks you have posted for AI experts.</p>
          </div>
        </header>

        <section className="post-form-card">
          <div className="projects-toolbar">
            <div>
              <h2 className="projects-title">Posted Tasks</h2>
              <p className="projects-subtitle">
                {jobs.length} task{jobs.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              className="draft-btn"
              type="button"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="alert alert-success">Loading projects...</div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && jobs.length === 0 && (
            <div className="empty-projects">
              <BriefcaseBusiness size={42} />
              <h3>No projects yet</h3>
              <p>You have not posted any tasks. Start by creating a new task.</p>

              <button
                className="next-btn"
                type="button"
                onClick={() => navigate("/client/post-job")}
              >
                Post a New Task
              </button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="project-list">
              {jobs.map((job) => {
                const jobId = job.id || job.job_id;

                return (
                  <article
                    className="project-card"
                    key={jobId || job.title}
                    onClick={() =>
                      jobId ? navigate(`/client/projects/${jobId}`) : null
                    }
                  >
                    <div className="project-card-header">
                      <div>
                        <h3>{job.title || job.jobTitle || "Untitled Task"}</h3>
                        <span>
                          {job.category || job.serviceCategory || "AI Task"}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <span className="project-status">
                          {job.status || "open"}
                        </span>

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

                    <p className="project-description">
                      {job.description || "No description provided."}
                    </p>

                    <div className="project-meta">
                      <span>
                        <DollarSign size={16} />
                        {job.budget ? `$${job.budget}` : "No budget"}
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