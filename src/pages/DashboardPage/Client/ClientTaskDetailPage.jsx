import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  DollarSign,
  Mail,
  MessageSquare,
  RefreshCcw,
  UserRound,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import { getJobById, getJobProposals } from "../../../Services/jobService";
import "./ClientMarketplace.css";

const getFirstArray = (result, keys) => {
  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) return result.data[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  return [];
};

const getJobPayload = (result) =>
  result?.jobPost ||
  result?.job ||
  result?.data?.jobPost ||
  result?.data?.job ||
  result?.data ||
  result?.project ||
  result;

const getExpertName = (proposal) =>
  proposal?.expert?.fullName ||
  proposal?.expert?.name ||
  proposal?.expertName ||
  proposal?.user?.fullName ||
  "AI Expert";

function ClientTaskDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(location.state?.job || null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proposalError, setProposalError] = useState("");

  const proposalCount = useMemo(() => proposals.length, [proposals]);

  const fetchDetail = useCallback(async () => {
    if (!jobId) {
      setError("Task ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProposalError("");

      const jobResult = await getJobById(jobId);
      setJob(getJobPayload(jobResult));

      try {
        const proposalResult = await getJobProposals(jobId);
        setProposals(
          getFirstArray(proposalResult, [
            "proposals",
            "proposalList",
            "items",
            "results",
          ])
        );
      } catch (proposalErr) {
        setProposals([]);
        setProposalError(
          proposalErr.message || "Could not load proposals for this task."
        );
      }
    } catch (err) {
      if (job) {
        setProposalError("Could not refresh task detail from the server.");
      } else {
        setError(err.message || "Failed to load task detail.");
      }
    } finally {
      setLoading(false);
    }
  }, [job, jobId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "No deadline";
    return new Date(dateValue).toLocaleDateString();
  };

  const formatBudget = (jobData) => {
    const min = jobData?.budget_min ?? jobData?.budgetMin;
    const max = jobData?.budget_max ?? jobData?.budgetMax ?? jobData?.budget;

    if (min && max && min !== max) return `$${min} - $${max}`;
    if (max) return `$${max}`;
    if (min) return `$${min}`;
    return "No budget";
  };

  const handleContactExpert = (proposal) => {
    const expertId =
      proposal?.expert?._id ||
      proposal?.expert?.id ||
      proposal?.expertId ||
      proposal?.user?._id ||
      proposal?.user?.id;

    navigate(expertId ? `/client/messages?expertId=${expertId}` : "/client/messages");
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="projects" />

      <main className="post-job-main">
        <header className="post-job-header">
          <button
            type="button"
            className="back-circle"
            onClick={() => navigate("/client/projects")}
          >
            <ArrowLeft size={26} />
          </button>

          <div>
            <h1>Task Detail</h1>
            <p>Review your task and proposals from AI experts.</p>
          </div>
        </header>

        {loading && <div className="alert alert-success">Loading task detail...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && job && (
          <>
            <section className="task-detail-grid">
              <article className="post-form-card task-detail-card">
                <div className="task-detail-header">
                  <div>
                    <span className="project-status">{job.status || "open"}</span>
                    <h2>{job.title || job.jobTitle || "Untitled Task"}</h2>
                    <p>
                      {job.required_skill ||
                        job.requiredSkill ||
                        job.category ||
                        job.serviceCategory ||
                        "AI Task"}
                    </p>
                  </div>

                  <button
                    className="draft-btn"
                    type="button"
                    onClick={fetchDetail}
                    disabled={loading}
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                </div>

                <p className="task-detail-description">
                  {job.description || "No description provided."}
                </p>

                <div className="task-detail-meta">
                  <span>
                    <DollarSign size={18} />
                    {formatBudget(job)}
                  </span>

                  <span>
                    <CalendarDays size={18} />
                    {formatDate(job.deadline)}
                  </span>

                  <span>
                    <MessageSquare size={18} />
                    {proposalCount} proposal{proposalCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </article>

              <aside className="post-form-card task-proposal-summary">
                <span>PROPOSALS</span>
                <strong>{proposalCount}</strong>
                <p>
                  Experts who are interested in this task will appear here after
                  they send a proposal.
                </p>
              </aside>
            </section>

            <section className="post-form-card proposals-panel">
              <div className="projects-toolbar">
                <div>
                  <h2 className="projects-title">Expert Proposals</h2>
                  <p className="projects-subtitle">
                    Compare proposals before contacting an expert.
                  </p>
                </div>
              </div>

              {proposalError && (
                <div className="alert alert-danger">{proposalError}</div>
              )}

              {proposals.length === 0 ? (
                <div className="empty-projects">
                  <MessageSquare size={42} />
                  <h3>No proposals yet</h3>
                  <p>Once experts send proposals, you will see them in this task detail.</p>
                </div>
              ) : (
                <div className="proposal-list">
                  {proposals.map((proposal, index) => {
                    const proposalId = proposal._id || proposal.id || index;
                    const budget =
                      proposal.proposedBudget ||
                      proposal.budget ||
                      proposal.price ||
                      proposal.rate;
                    const duration =
                      proposal.estimatedDuration ||
                      proposal.duration ||
                      proposal.timeline;

                    return (
                      <article className="proposal-card" key={proposalId}>
                        <div className="proposal-card-header">
                          <div className="proposal-expert">
                            <div className="proposal-avatar">
                              <UserRound size={22} />
                            </div>

                            <div>
                              <h3>{getExpertName(proposal)}</h3>
                              <p>{proposal?.expert?.professionalTitle || "AI Expert"}</p>
                            </div>
                          </div>

                          <span className="project-status">
                            {proposal.status || "pending"}
                          </span>
                        </div>

                        <p className="proposal-cover">
                          {proposal.coverLetter ||
                            proposal.message ||
                            proposal.description ||
                            "This expert has sent a proposal for your task."}
                        </p>

                        <div className="proposal-meta">
                          <span>
                            <DollarSign size={16} />
                            {budget ? `$${budget}` : "Budget not specified"}
                          </span>

                          <span>
                            <CalendarDays size={16} />
                            {duration || "Timeline not specified"}
                          </span>
                        </div>

                        <div className="proposal-actions">
                          <button
                            type="button"
                            className="next-btn"
                            onClick={() => handleContactExpert(proposal)}
                          >
                            <Mail size={16} />
                            Contact Expert
                          </button>

                          <button type="button" className="draft-btn">
                            Review Later
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientTaskDetailPage;
