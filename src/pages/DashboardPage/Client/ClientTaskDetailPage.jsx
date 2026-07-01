import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  DollarSign,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCcw,
  UserRound,
  X,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import { getJobById, getJobProposals } from "../../../Services/jobService";
import { updateProposalStatus } from "../../../Services/proposalService";
import { createProject } from "../../../Services/projectService";
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
  proposal?.expert_name ||
  proposal?.user?.fullName ||
  "AI Expert";

function ClientTaskDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingProposal, setActingProposal] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

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

      const [jobResult, proposalResult] = await Promise.all([
        getJobById(jobId),
        getJobProposals(jobId),
      ]);

      setJob(getJobPayload(jobResult));
      setProposals(
        getFirstArray(proposalResult, [
          "proposals",
          "proposalList",
          "items",
          "results",
        ])
      );
    } catch (err) {
      setError(err.message || "Failed to load task detail.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

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

  const handleAcceptProposal = async (proposalId) => {
    if (actingProposal) return;
    const startNow = window.confirm("Do you want to start a project with this proposal?");
    setActingProposal(proposalId);
    try {
      if (startNow) {
        await updateProposalStatus({ proposalId, status: 'accepted', start_project: true });
        alert("Project started successfully!");
        navigate("/client/projects");
      } else {
        await updateProposalStatus({ proposalId, status: 'accepted', start_project: false });
        alert("Proposal accepted. The task is now in pending status.");
        await fetchDetail();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActingProposal(null);
    }
  };

  const handleStartProjectFromPending = async () => {
    try {
      setLoading(true);
      setError("");
      await createProject(jobId);
      alert("Project created successfully!");
      navigate("/client/projects");
    } catch (err) {
      setError(err.message || "Failed to create project from pending task.");
      setLoading(false);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    if (actingProposal) return;
    setActingProposal(proposalId);
    try {
      await updateProposalStatus({ proposalId, status: 'rejected' });
      setProposals(prev => prev.map(p =>
        (p._id || p.id) === proposalId ? { ...p, status: 'rejected' } : p
      ));
      setSelectedProposal(prev => prev ? { ...prev, status: 'rejected' } : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingProposal(null);
    }
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
                    {job.status === 'pending' && (
                      <button
                        className="next-btn"
                        style={{ marginTop: '10px', display: 'inline-flex', padding: '8px 16px', fontSize: '0.85rem' }}
                        type="button"
                        onClick={handleStartProjectFromPending}
                      >
                        Create Project
                      </button>
                    )}
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

              {proposals.length === 0 ? (
                <div className="empty-projects">
                  <MessageSquare size={42} />
                  <h3>No proposals yet</h3>
                  <p>Once experts send proposals, you will see them in this task detail.</p>
                </div>
              ) : (
                <div className="proposal-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {proposals.map((proposal, index) => {
                    const proposalId = proposal._id || proposal.id || index;
                    return (
                      <article
                        className="proposal-card clickable-proposal-card"
                        key={proposalId}
                        style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '20px', borderRadius: '12px' }}
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <div className="proposal-card-header" style={{ marginBottom: 0, borderBottom: 'none' }}>
                          <div className="proposal-expert">
                            <div className="proposal-avatar">
                              <UserRound size={22} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0 }}>{getExpertName(proposal)}</h3>
                              <p style={{ margin: '4px 0 0 0' }}>{proposal?.expert?.professionalTitle || proposal.professional_title || "AI Expert"}</p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {selectedProposal && (
              <div className="modal-overlay" onClick={() => setSelectedProposal(null)}>
                <div
                  className="success-modal proposal-detail-modal"
                  style={{
                    background: '#0b1220',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    maxWidth: '600px',
                    width: '90%',
                    textAlign: 'left',
                    padding: '30px',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
                  }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <h3 className="fw-bold mb-0 text-white" style={{ fontSize: '1.4rem' }}>Proposal Details</h3>
                    <button
                      className="btn-close btn-close-white"
                      onClick={() => setSelectedProposal(null)}
                      style={{ filter: 'invert(1)', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="modal-body" style={{ fontSize: '0.95rem' }}>
                    <div className="d-flex align-items-center mb-4">
                      <div
                        className="proposal-avatar"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <UserRound size={24} />
                      </div>
                      <div>
                        <h4 className="m-0 text-white fw-semibold" style={{ fontSize: '1.15rem' }}>{getExpertName(selectedProposal)}</h4>
                        <p className="m-0 text-muted small">{selectedProposal?.expert?.professionalTitle || selectedProposal.professional_title || "AI Expert"}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-muted small fw-bold d-block mb-1">COVER LETTER</label>
                      <p className="p-3 rounded bg-dark bg-opacity-20 border border-secondary border-opacity-10 text-light" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                        {selectedProposal.coverLetter ||
                          selectedProposal.cover_letter ||
                          selectedProposal.message ||
                          selectedProposal.description ||
                          "This expert has sent a proposal for your task."}
                      </p>
                    </div>

                    <div className="row mb-4">
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block mb-1">PROPOSED BUDGET</span>
                        <strong className="text-white d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                          <DollarSign size={18} className="text-primary me-1" />
                          {selectedProposal.proposedBudget || selectedProposal.bid_amount || selectedProposal.budget || selectedProposal.price || selectedProposal.rate
                            ? `$${selectedProposal.proposedBudget || selectedProposal.bid_amount || selectedProposal.budget || selectedProposal.price || selectedProposal.rate}`
                            : "Budget not specified"}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block mb-1">ESTIMATED TIMELINE</span>
                        <strong className="text-white d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
                          <CalendarDays size={18} className="text-primary me-1" />
                          {selectedProposal.estimatedDuration || selectedProposal.delivery_days || selectedProposal.duration || selectedProposal.timeline
                            ? `${selectedProposal.estimatedDuration || selectedProposal.delivery_days || selectedProposal.duration || selectedProposal.timeline} days`
                            : "Timeline not specified"}
                        </strong>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-muted small fw-bold d-block mb-1">STATUS</span>
                      <span className={`project-status d-inline-block mt-1 ${
                        selectedProposal.status === 'accepted' ? 'accepted-status' : selectedProposal.status === 'rejected' ? 'rejected-status' : ''
                      }`}>
                        {selectedProposal.status || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2 justify-content-end pt-3 border-top border-secondary border-opacity-25 mt-4">
                    {selectedProposal.status === "accepted" ? (
                      <span className="project-status accepted-status d-flex align-items-center py-2 px-3">
                        <Check size={14} className="me-1" /> Accepted
                      </span>
                    ) : selectedProposal.status === "rejected" ? (
                      <span className="project-status rejected-status d-flex align-items-center py-2 px-3">
                        <X size={14} className="me-1" /> Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger px-3 py-2 fw-semibold"
                          style={{ borderRadius: '8px' }}
                          onClick={() => handleRejectProposal(selectedProposal._id || selectedProposal.id)}
                          disabled={actingProposal !== null}
                        >
                          {actingProposal === (selectedProposal._id || selectedProposal.id) ? (
                            <Loader2 className="animate-spin me-1 d-inline" size={14} />
                          ) : null}
                          Reject
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-success px-3 py-2 fw-semibold"
                          style={{ borderRadius: '8px' }}
                          onClick={() => handleAcceptProposal(selectedProposal._id || selectedProposal.id)}
                          disabled={actingProposal !== null}
                        >
                          {actingProposal === (selectedProposal._id || selectedProposal.id) ? (
                            <Loader2 className="animate-spin me-1 d-inline" size={14} />
                          ) : null}
                          Approve
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-3 py-2 fw-semibold"
                          style={{ borderRadius: '8px' }}
                          onClick={() => {
                            setSelectedProposal(null);
                            handleContactExpert(selectedProposal);
                          }}
                        >
                          <Mail size={14} className="me-1" />
                          Message
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientTaskDetailPage;