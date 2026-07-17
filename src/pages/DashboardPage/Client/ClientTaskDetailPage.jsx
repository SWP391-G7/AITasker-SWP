import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
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
import { updateProposalStatus, counterProposal, initiateProposalPayment } from "../../../Services/proposalService";
import { createProject } from "../../../Services/projectService";
import { getOrCreateConversation } from "../../../Services/messageService";
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

/** Returns status badge color */
const statusColor = (status) => {
  switch (status) {
    case "accepted": return "#10b981";
    case "rejected": return "#ef4444";
    case "countered": return "#f59e0b";
    default: return "#6b7280";
  }
};

function ClientTaskDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // ── Data state ──────────────────────────────────────────────────
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Modal / action state ─────────────────────────────────────────
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actingProposal, setActingProposal] = useState(null);

  // Counter-offer form state (inside the proposal modal)
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterBid, setCounterBid] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [counterError, setCounterError] = useState("");

  // Project-start prompt
  const [showProjectPrompt, setShowProjectPrompt] = useState(false);
  const [pendingProposalId, setPendingProposalId] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────
  const proposalCount = useMemo(() => proposals.length, [proposals]);

  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || parsed?._id || null;
    } catch {
      return null;
    }
  }, []);

  /** Is it this user's turn to respond to a counter? */
  const isMyTurnToRespond = (proposal) =>
    proposal.status === "countered" &&
    proposal.counter_initiated_by !== currentUserId;

  /** Did *I* send the latest counter (waiting for other party)? */
  const iWaitingForReply = (proposal) =>
    proposal.status === "countered" &&
    proposal.counter_initiated_by === currentUserId;

  // ── Data fetching ────────────────────────────────────────────────
  const fetchDetail = useCallback(async () => {
    if (!jobId) { setError("Task ID is missing."); setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      const [jobResult, proposalResult] = await Promise.all([
        getJobById(jobId),
        getJobProposals(jobId),
      ]);
      setJob(getJobPayload(jobResult));
      setProposals(
        getFirstArray(proposalResult, ["proposals", "proposalList", "items", "results"])
      );
    } catch (err) {
      setError(err.message || "Failed to load task detail.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const pId = params.get("proposalId");
    const errorMsg = params.get("error");

    if (paymentStatus === "success" && pId) {
      setPendingProposalId(pId);
      setShowProjectPrompt(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "failed" && errorMsg) {
      setError("Payment failed: " + decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ── Formatting ───────────────────────────────────────────────────
  const formatDuration = (days) => {
    if (!days) return 'Duration TBD';
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const formatBudget = (jobData) => {
    const min = jobData?.budget_min ?? jobData?.budgetMin;
    const max = jobData?.budget_max ?? jobData?.budgetMax ?? jobData?.budget;
    if (min && max && min !== max) return `$${min} – $${max}`;
    if (max) return `$${max}`;
    if (min) return `$${min}`;
    return "No budget";
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const getProposalExpertId = (proposal) =>
    proposal?.expert?._id ||
    proposal?.expert?.id ||
    proposal?.expert_id ||
    proposal?.expertId ||
    proposal?.user?._id ||
    proposal?.user?.id;

  const handleContactExpert = async (proposal) => {
    const expertId =
      getProposalExpertId(proposal);

    if (!expertId) {
      navigate("/client/messages");
      return;
    }
  }

  /** Client clicks Approve on a proposal (can be a plain proposal or a counter from expert) */
  const handleAcceptProposal = async (proposalId) => {
    const proposal = proposals.find(p => (p._id || p.id) === proposalId);
    if (!proposal) return;

    const bidAmount = (proposal.status === "countered" && proposal.counter_bid_amount)
      ? parseFloat(proposal.counter_bid_amount)
      : parseFloat(proposal.bid_amount);

    const clientBudget = parseFloat(job?.client_budget ?? job?.clientBudget ?? 0);

    if (clientBudget < bidAmount) {
      setError("Your budget is not enough to choose this proposal");
      // Scroll to top to see error message
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setActingProposal(proposalId);
    try {
      setError("");
      const result = await initiateProposalPayment(proposalId);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("Failed to generate payment redirect link");
      }
    } catch (err) {
      setError(err.message || "Failed to initiate payment session");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setActingProposal(null);
    }
  };

  /** Confirm from the "Start Project?" dialog */
  const confirmProposalAcceptance = async (startProject) => {
    setShowProjectPrompt(false);
    const proposalId = pendingProposalId;
    if (!proposalId) return;

    // Check if the proposal in our state is already accepted (from successful payment redirect)
    const proposal = proposals.find(p => (p._id || p.id) === proposalId);
    if (proposal && (proposal.status === "accepted" || job?.status === "closed")) {
      if (startProject) {
        setActingProposal(proposalId);
        try {
          setError("");
          const result = await createProject(jobId);
          if (result.project?.id) {
            navigate(`/projects/${result.project.id}`);
          } else {
            navigate("/client/projects");
          }
        } catch (err) {
          setError(err.message || "Failed to start project");
        } finally {
          setActingProposal(null);
          setPendingProposalId(null);
        }
      } else {
        // User paid but declined immediate project start, just reload details
        setPendingProposalId(null);
        fetchDetail();
      }
      return;
    }

    // Fallback/Legacy code pathway (for other states, safety only)
    setActingProposal(proposalId);
    try {
      setError("");
      const result = await updateProposalStatus({ proposalId, status: "accepted", start_project: startProject });
      const updatedProposal = result.proposal || { status: "accepted" };
      setProposals(prev =>
        prev.map(p => (p._id || p.id) === proposalId ? { ...p, ...updatedProposal } : p)
      );
      setSelectedProposal(prev => prev ? { ...prev, ...updatedProposal } : null);

      if (startProject && result.project?.id) {
        navigate(`/projects/${result.project.id}`);
      } else {
        setJob(prev => prev ? { ...prev, status: startProject ? "closed" : "pending" } : null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActingProposal(null);
      setPendingProposalId(null);
    }
  };

  /** Client manually starts project from a pending job */
  const handleCreateProjectFromPending = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await createProject(jobId);
      if (result.project?.id) navigate(`/projects/${result.project.id}`);
      else navigate("/client/projects");
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  /** Reject a proposal */
  const handleRejectProposal = async (proposalId) => {
    if (actingProposal) return;
    setActingProposal(proposalId);
    try {
      await updateProposalStatus({ proposalId, status: "rejected" });
      setProposals(prev =>
        prev.map(p => (p._id || p.id) === proposalId ? { ...p, status: "rejected" } : p)
      );
      setSelectedProposal(prev => prev ? { ...prev, status: "rejected" } : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingProposal(null);
    }
  };

  /** Submit a counter-offer */
  const handleSubmitCounter = async () => {
    setCounterError("");
    const amount = parseFloat(counterBid);
    if (!counterBid || isNaN(amount) || amount <= 0) {
      setCounterError("Please enter a valid bid amount.");
      return;
    }
    const proposalId = selectedProposal?._id || selectedProposal?.id;
    if (!proposalId || actingProposal) return;
    setActingProposal(proposalId);
    try {
      const result = await counterProposal({ proposalId, bidAmount: amount, coverLetter: counterNote });
      const updated = result.proposal;
      setProposals(prev => prev.map(p => (p._id || p.id) === proposalId ? { ...p, ...updated } : p));
      setSelectedProposal(prev => prev ? { ...prev, ...updated } : null);
      setShowCounterForm(false);
      setCounterBid("");
      setCounterNote("");
    } catch (err) {
      setCounterError(err.message);
    } finally {
      setActingProposal(null);
    }
  };

  const openCounterForm = () => {
    setCounterBid(
      selectedProposal?.counter_bid_amount || selectedProposal?.bid_amount || ""
    );
    setCounterNote("");
    setCounterError("");
    setShowCounterForm(true);
  };

  const closeModal = () => {
    setSelectedProposal(null);
    setShowCounterForm(false);
    setCounterBid("");
    setCounterNote("");
    setCounterError("");
  };

  // ── Render action buttons for the modal ──────────────────────────
  const renderModalActions = (proposal) => {
    const pid = proposal._id || proposal.id;
    const busy = actingProposal === pid;

    if (job && (job.status === "removed" || job.status === "rejected")) {
      return (
        <span className="text-danger small fw-bold">
          No actions available (Job Removed by Admin)
        </span>
      );
    }

    if (proposal.status === "accepted") {
      return (
        <span className="project-status accepted-status d-flex align-items-center py-2 px-3">
          <Check size={14} className="me-1" /> Accepted
        </span>
      );
    }

    if (proposal.status === "rejected") {
      return (
        <span className="project-status rejected-status d-flex align-items-center py-2 px-3">
          <X size={14} className="me-1" /> Rejected
        </span>
      );
    }

    // Waiting for the other party to reply to MY counter
    if (iWaitingForReply(proposal)) {
      return (
        <>
          <span className="text-muted small fst-italic me-auto">
            Waiting for expert to respond…
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning px-3 py-2 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={openCounterForm}
            disabled={busy}
          >
            Counter Again
          </button>
        </>
      );
    }

    // It's my turn to respond to a counter from the expert
    if (isMyTurnToRespond(proposal)) {
      return (
        <>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger px-3 py-2 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={() => handleRejectProposal(pid)}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : null}
            Reject
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning px-3 py-2 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={openCounterForm}
            disabled={busy}
          >
            Counter Again
          </button>
          <button
            type="button"
            className="btn btn-sm btn-success px-3 py-2 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={() => handleAcceptProposal(pid)}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : null}
            Approve Counter
          </button>
        </>
      );
    }

    // Normal pending proposal — Reject / Counter / Approve
    return (
      <>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger px-3 py-2 fw-semibold"
          style={{ borderRadius: "8px" }}
          onClick={() => handleRejectProposal(pid)}
          disabled={busy}
        >
          {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : null}
          Reject
        </button>

        <button
          type="button"
          className="btn btn-sm btn-outline-warning px-3 py-2 fw-semibold"
          style={{ borderRadius: "8px" }}
          onClick={openCounterForm}
          disabled={busy}
        >
          Counter Offer
        </button>

        <button
          type="button"
          className="btn btn-sm btn-success px-3 py-2 fw-semibold"
          style={{ borderRadius: "8px" }}
          onClick={() => handleAcceptProposal(pid)}
          disabled={busy}
        >
          {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : null}
          Approve
        </button>

        <button
          type="button"
          className="btn btn-sm btn-primary px-3 py-2 fw-semibold"
          style={{ borderRadius: "8px" }}
          onClick={() => { closeModal(); handleContactExpert(proposal); }}
        >
          <Mail size={14} className="me-1" />
          Message
        </button>
      </>
    );
  };

  // ── JSX ──────────────────────────────────────────────────────────
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
            {job.status === 'removed' && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                <strong>Warning:</strong> This task has been removed by the administrator due to policy violations. You cannot perform any actions on this task.
              </div>
            )}

            {/* ── Job summary ─────────────────────────────────────── */}
            <section className="task-detail-grid">
              <article className="post-form-card task-detail-card">
                <div className="task-detail-header">
                  <div>
                    <span 
                      className={`project-status ${job.status === 'removed' ? 'rejected-status' : ''}`}
                      style={job.status === 'removed' ? { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', textTransform: 'capitalize' } : {}}
                    >
                      {job.status === 'removed' ? 'Removed by Admin' : (job.status || "open")}
                    </span>
                    <h2>{job.title || job.jobTitle || "Untitled Task"}</h2>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {job.status === "pending" && (
                      <button
                        className="btn btn-success fw-bold"
                        style={{ borderRadius: "8px", padding: "8px 16px", backgroundColor: "#10b981", border: "none", color: "#fff" }}
                        type="button"
                        onClick={handleCreateProjectFromPending}
                        disabled={loading}
                      >
                        Create Project
                      </button>
                    )}
                    <button className="draft-btn" type="button" onClick={fetchDetail} disabled={loading}>
                      <RefreshCcw size={16} /> Refresh
                    </button>
                  </div>
                </div>

                <p className="task-detail-description">{job.description || "No description provided."}</p>

                <div className="task-detail-meta">
                  <span><DollarSign size={18} />{formatBudget(job)}</span>
                  <span><CalendarDays size={18} />{formatDuration(job.duration_days)}</span>
                  <span><MessageSquare size={18} />{proposalCount} proposal{proposalCount !== 1 ? "s" : ""}</span>
                </div>
              </article>

              <aside className="post-form-card task-proposal-summary">
                <span>PROPOSALS</span>
                <strong>{proposalCount}</strong>
                <p>Experts who are interested in this task will appear here after they send a proposal.</p>
              </aside>
            </section>

            {/* ── Proposal list ────────────────────────────────────── */}
            <section className="post-form-card proposals-panel">
              <div className="projects-toolbar">
                <div>
                  <h2 className="projects-title">Expert Proposals</h2>
                  <p className="projects-subtitle">Compare proposals before contacting an expert.</p>
                </div>
              </div>

              {proposals.length === 0 ? (
                <div className="empty-projects">
                  <MessageSquare size={42} />
                  <h3>No proposals yet</h3>
                  <p>Once experts send proposals, you will see them in this task detail.</p>
                </div>
              ) : (
                <div className="proposal-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {proposals.map((proposal, index) => {
                    const pid = proposal._id || proposal.id || index;
                    return (
                      <article
                        key={pid}
                        className="proposal-card clickable-proposal-card"
                        style={{ cursor: "pointer", transition: "all 0.2s", padding: "20px", borderRadius: "12px" }}
                        onClick={() => { setSelectedProposal(proposal); setShowCounterForm(false); }}
                      >
                        <div className="proposal-card-header" style={{ marginBottom: 0, borderBottom: "none" }}>
                          <div className="proposal-expert">
                            <div className="proposal-avatar"><UserRound size={22} /></div>
                            <div>
                              <h3 style={{ margin: 0 }}>{getExpertName(proposal)}</h3>
                              <p style={{ margin: "4px 0 0 0" }}>{proposal?.expert?.professionalTitle || proposal.professional_title || "AI Expert"}</p>
                            </div>
                          </div>
                          {/* Status badge */}
                          <span style={{
                            marginTop: "10px",
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: statusColor(proposal.status) + "22",
                            color: statusColor(proposal.status),
                            border: `1px solid ${statusColor(proposal.status)}44`
                          }}>
                            {proposal.status === "countered" && isMyTurnToRespond(proposal) ? "Counter Received" : proposal.status || "pending"}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Proposal detail modal ────────────────────────────── */}
            {selectedProposal && (
              <div className="modal-overlay" onClick={closeModal}>
                <div
                  className="success-modal proposal-detail-modal"
                  style={{
                    background: "#0b1220",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    maxWidth: "920px",
                    width: "min(94vw, 920px)",
                    textAlign: "left",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    maxHeight: "90vh",
                    overflowY: "auto"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                    <h3 className="fw-bold mb-0 text-white" style={{ fontSize: "1.4rem" }}>Proposal Details</h3>
                    <button onClick={closeModal} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                      <X size={24} />
                    </button>
                  </div>

                  <div className="modal-body" style={{ fontSize: "0.95rem" }}>
                    {/* Expert info */}
                    <div className="d-flex align-items-center mb-4">
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 15, border: "1px solid rgba(255,255,255,0.1)" }}>
                        <UserRound size={24} />
                      </div>
                      <div>
                        <h4 className="m-0 text-white fw-semibold" style={{ fontSize: "1.15rem" }}>{getExpertName(selectedProposal)}</h4>
                        <p className="m-0 text-muted small">{selectedProposal?.expert?.professionalTitle || selectedProposal.professional_title || "AI Expert"}</p>
                      </div>
                    </div>

                    {/* Cover letter */}
                    <div className="mb-4">
                      <label className="text-muted small fw-bold d-block mb-1">COVER LETTER</label>
                      <p className="p-3 rounded border border-secondary border-opacity-10 text-light" style={{ whiteSpace: "pre-wrap", maxHeight: 160, overflowY: "auto", background: "rgba(255,255,255,0.04)" }}>
                        {selectedProposal.coverLetter || selectedProposal.cover_letter || selectedProposal.message || "This expert has sent a proposal for your task."}
                      </p>
                    </div>

                    {/* Bid / timeline */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block mb-1">PROPOSED BID</span>
                        <strong className="text-white d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
                          <DollarSign size={18} className="text-primary me-1" />
                          {selectedProposal.bid_amount ? `$${selectedProposal.bid_amount}` : "Not specified"}
                        </strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block mb-1">DELIVERY</span>
                        <strong className="text-white d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
                          <CalendarDays size={18} className="text-primary me-1" />
                          {selectedProposal.delivery_days ? `${selectedProposal.delivery_days} days` : "Not specified"}
                        </strong>
                      </div>
                    </div>

                    {/* Counter-proposal info (shown when status is countered) */}
                    {selectedProposal.status === "countered" && selectedProposal.counter_bid_amount && (
                      <div className="mb-4 p-3 rounded" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                        <span className="fw-bold d-block mb-2" style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                          COUNTER-OFFER {iWaitingForReply(selectedProposal) ? "(sent by you)" : "(received)"}
                        </span>
                        <div className="row">
                          <div className="col-6">
                            <span className="text-muted small fw-bold d-block mb-1">COUNTER BID</span>
                            <strong className="text-white" style={{ fontSize: "1.05rem" }}>
                              ${selectedProposal.counter_bid_amount}
                            </strong>
                          </div>
                        </div>
                        {selectedProposal.counter_cover_letter && (
                          <div className="mt-2">
                            <span className="text-muted small fw-bold d-block mb-1">COUNTER MESSAGE</span>
                            <p className="text-light mb-0" style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                              {selectedProposal.counter_cover_letter}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div className="mb-4">
                      <span className="text-muted small fw-bold d-block mb-1">STATUS</span>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        background: statusColor(selectedProposal.status) + "22",
                        color: statusColor(selectedProposal.status),
                        border: `1px solid ${statusColor(selectedProposal.status)}44`,
                        textTransform: "capitalize"
                      }}>
                        {selectedProposal.status || "pending"}
                      </span>
                    </div>

                    {/* ── Counter-offer form (inline, collapsible) ── */}
                    {showCounterForm && (
                      <div className="mb-4 p-3 rounded" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.3)" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-bold" style={{ color: "#a5b4fc", fontSize: "0.85rem" }}>SEND COUNTER-OFFER</span>
                          <button onClick={() => setShowCounterForm(false)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        <label className="text-muted small fw-bold d-block mb-1">YOUR BID AMOUNT ($)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={counterBid}
                          onChange={(e) => setCounterBid(e.target.value)}
                          placeholder="e.g. 1200"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            fontSize: "0.95rem",
                            marginBottom: "12px",
                            outline: "none"
                          }}
                        />

                        <label className="text-muted small fw-bold d-block mb-1">MESSAGE (optional)</label>
                        <textarea
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          placeholder="Explain your counter-offer…"
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#fff",
                            fontSize: "0.9rem",
                            resize: "vertical",
                            outline: "none",
                            marginBottom: "12px"
                          }}
                        />

                        {counterError && (
                          <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "8px" }}>{counterError}</p>
                        )}

                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            onClick={() => setShowCounterForm(false)}
                            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#9ca3af", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmitCounter}
                            disabled={actingProposal !== null}
                            style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}
                          >
                            {actingProposal ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : null}
                            Send Counter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer action buttons */}
                  <div className="d-flex gap-2 justify-content-end flex-wrap pt-3 border-top border-secondary border-opacity-25 mt-2">
                    {renderModalActions(selectedProposal)}
                  </div>
                </div>
              </div>
            )}

            {/* ── Start Project? prompt ────────────────────────────── */}
            {showProjectPrompt && (
              <div className="modal-overlay" onClick={() => setShowProjectPrompt(false)}>
                <div
                  className="success-modal"
                  style={{
                    background: "#0b1220",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    maxWidth: "450px",
                    width: "90%",
                    textAlign: "center",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="fw-bold mb-3 text-white" style={{ fontSize: "1.3rem" }}>Start Project?</h3>
                  <p className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                    Do you want to start a project with this proposal immediately, or keep it pending so you can review later?
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button
                      type="button"
                      style={{ borderRadius: "8px", fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "10px 20px" }}
                      onClick={() => confirmProposalAcceptance(false)}
                    >
                      No, Keep Pending
                    </button>
                    <button
                      type="button"
                      style={{ borderRadius: "8px", fontWeight: 600, cursor: "pointer", backgroundColor: "#10b981", border: "none", color: "#fff", padding: "10px 20px" }}
                      onClick={() => confirmProposalAcceptance(true)}
                    >
                      Yes, Start Project
                    </button>
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

