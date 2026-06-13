import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/dashboard/Sidebar";
import DashboardHeader from "../Components/dashboard/DashboardHeader";
import { getMyJobs } from "../Services/jobService";
import "./MyJobsPage.css";

function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const jobList = await getMyJobs();
      setJobs(jobList);
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError(err.message || "Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJobRedirect = () => {
    navigate("/post-job");
  };

  const formatBudget = (min, max) => {
    if (min !== null && max !== null) {
      return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
    }
    if (min !== null) {
      return `Min $${Number(min).toLocaleString()}`;
    }
    if (max !== null) {
      return `Max $${Number(max).toLocaleString()}`;
    }
    return "Flexible Budget";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader 
          title="My Projects" 
          subtitle="Manage all your posted jobs, budgets, and deadlines in one place." 
        />

        <div className="my-jobs-container">
          <div className="my-jobs-header-actions">
            <h2>Your Postings ({jobs.length})</h2>
            <button className="primary-action-btn glow-hover" onClick={handlePostJobRedirect}>
              ＋ Post a New Job
            </button>
          </div>

          {isLoading ? (
            <div className="jobs-loading-state">
              <div className="spinner"></div>
              <p>Fetching your project postings...</p>
            </div>
          ) : error ? (
            <div className="jobs-error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchJobs}>Retry</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="jobs-empty-state">
              <div className="empty-state-icon">📁</div>
              <h3>No jobs posted yet</h3>
              <p>Post a job to connect with top-tier AI developers and professional experts.</p>
              <button className="empty-state-btn glow-hover" onClick={handlePostJobRedirect}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="jobs-table-wrapper">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Skill Required</th>
                    <th>Budget</th>
                    <th>Duration</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="job-table-row">
                      <td className="job-title-cell">
                        <span className="job-title">{job.title}</span>
                        {job.description && (
                          <p className="job-description-truncate">
                            {job.description.length > 80
                              ? `${job.description.substring(0, 80)}...`
                              : job.description}
                          </p>
                        )}
                      </td>
                      <td>
                        {job.required_skill ? (
                          <span className="skill-badge">{job.required_skill}</span>
                        ) : (
                          <span className="skill-badge-empty">Any Skill</span>
                        )}
                      </td>
                      <td className="job-budget-cell">
                        {formatBudget(job.budget_min, job.budget_max)}
                      </td>
                      <td>
                        {job.duration_days ? `${job.duration_days} Days` : "Flexible"}
                      </td>
                      <td>
                        {formatDate(job.deadline)}
                      </td>
                      <td>
                        <span className={`status-badge ${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyJobsPage;
