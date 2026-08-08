/**
 * Frontend module: pages/DashboardPage/Client/ClientTaskDetailPage.jsx
 *
 * Vai trò: Page Client Task Detail Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  Mail,
  MessageSquare,
  Play,
  RefreshCcw,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import Footer from "../../../Components/Footer/Footer";
import { getJobById, getJobProposals } from "../../../Services/jobService";
import { updateProposalStatus, counterProposal, initiateProposalPayment } from "../../../Services/proposalService";
import { createProject } from "../../../Services/projectService";
import { getOrCreateConversation } from "../../../Services/messageService";
import { analyzeProposalsWithAI } from "../../../Services/aiService";
import PaymentSourceDialog from "../../../Components/Payment/PaymentSourceDialog";
import "../Style/AdminDashboardPage.css";
import "../Style/ExpertDashboardPage.css";
import "./ClientMarketplace.css";

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get first array”
const getFirstArray = (result, keys) => {
  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) return result.data[key];
  }
  if (Array.isArray(result?.data)) return result.data;
  return [];
};

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get job payload”
const getJobPayload = (result) =>
  result?.jobPost ||
  result?.job ||
  result?.data?.jobPost ||
  result?.data?.job ||
  result?.data ||
  result?.project ||
  result;

// Đọc hoặc suy ra dữ liệu cho nghiệp vụ “get expert name”
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

// React component “Client Task Detail Page”
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
  const [paymentProposal, setPaymentProposal] = useState(null);

  // Counter-offer form state
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterBid, setCounterBid] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [counterError, setCounterError] = useState("");

  // Project-start prompt
  const [showProjectPrompt, setShowProjectPrompt] = useState(false);
  const [pendingProposalId, setPendingProposalId] = useState(null);

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState("");

  // ── Helpers ──────────────────────────────────────────────────────
  const proposalCount = useMemo(() => proposals.length, [proposals]);

  const acceptedProposal = useMemo(() => proposals.find(p => p.status === "accepted"), [proposals]);

  /** Sort proposals so Recommended (score >= 80) appear first, followed by highest score */
  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const scoreA = typeof a.ai_match_score === "number" ? a.ai_match_score : -1;
      const scoreB = typeof b.ai_match_score === "number" ? b.ai_match_score : -1;
      const isRecA = scoreA >= 80 ? 1 : 0;
      const isRecB = scoreB >= 80 ? 1 : 0;
      if (isRecB !== isRecA) return isRecB - isRecA; // Recommended first
      return scoreB - scoreA; // Highest score first
    });
  }, [proposals]);

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

  /** Trigger AI re-evaluation of proposals */
  const handleReanalyzeProposals = async () => {
    if (!jobId || isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      setAnalysisFeedback("");
      const updatedProposals = await analyzeProposalsWithAI(jobId);
      if (Array.isArray(updatedProposals) && updatedProposals.length > 0) {
        setProposals(updatedProposals);
        setAnalysisFeedback(`AI analysis complete! ${updatedProposals.length} proposal(s) evaluated and scored.`);
        if (selectedProposal) {
          const match = updatedProposals.find(p => p.id === selectedProposal.id || p._id === selectedProposal.id);
          if (match) setSelectedProposal(match);
        }
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAnalysisFeedback("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisFeedback(""), 6000);
    }
  };

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
    const expertId = getProposalExpertId(proposal);
    if (!expertId) {
      navigate("/client/messages");
      return;
    }
    const pid = proposal?._id || proposal?.id;
    try {
      if (pid) setActingProposal(pid);
      const conversation = await getOrCreateConversation(expertId);
      const convId = conversation?.id || conversation?._id || conversation?.data?.id || conversation?.data?._id;
      navigate("/client/messages", { state: { activeConversationId: convId } });
    } catch (err) {
      console.error("Failed to start conversation with expert:", err);
      navigate("/client/messages");
    } finally {
      if (pid) setActingProposal(null);
    }
  };

  /** Client clicks Approve on a proposal */
  const handleAcceptProposal = (proposalId) => {
    const proposal = proposals.find(p => (p._id || p.id) === proposalId);
    if (!proposal) return;
    setPaymentProposal(proposal);
  };

  const handlePaymentSource = async (paymentSource) => {
    const proposalId = paymentProposal?._id || paymentProposal?.id;
    if (!proposalId) return;
    setActingProposal(proposalId);
    try {
      setError("");
      const result = await initiateProposalPayment(proposalId, paymentSource);
      if (result.funded) {
        setPaymentProposal(null);
        setPendingProposalId(proposalId);
        setShowProjectPrompt(true);
        fetchDetail();
        return;
      }
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
        setPendingProposalId(null);
        fetchDetail();
      }
      return;
    }

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

  const handleRejectProposal = async (proposalId) => {
    if (actingProposal) return;
    setActingProposal(proposalId);
    try {
      await updateProposalStatus({ proposalId, status: "rejected" });
      setProposals(prev =>
        prev.map(p => (p._id || p.id) === proposalId ? { ...p, status: "rejected" } : p)
      );
      setSelectedProposal(prev => prev ? { ...prev, ...updatedProposal } : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActingProposal(null);
    }
  };

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

  const handleTabChange = (tabId) => {
    if (tabId === "dashboard") navigate("/client/dashboard");
    else navigate(`/client/${tabId}`);
  };

  // ── Render action buttons for proposal modal / cards ──────────────
  const renderProposalActions = (proposal) => {
    const pid = proposal._id || proposal.id;
    const busy = actingProposal === pid;

    if (job && (job.status === "removed" || job.status === "rejected")) {
      return (
        <span className="text-danger small fw-bold">
          No actions available (Task Removed)
        </span>
      );
    }

    if (proposal.status === "accepted") {
      if (proposal.payment_status !== "funded") {
        return (
          <button
            type="button"
            className="btn btn-sm btn-success fw-bold px-3 py-2"
            style={{ borderRadius: "8px", backgroundColor: "#10b981", border: "none", color: "#fff" }}
            onClick={(e) => { e.stopPropagation(); handleAcceptProposal(pid); }}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : <CreditCard size={14} className="me-1" />}
            Fund Escrow
          </button>
        );
      }
      return (
        <span className="project-status accepted-status d-flex align-items-center py-2 px-3" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
          <Check size={14} className="me-1" /> Accepted & Escrow Funded
        </span>
      );
    }

    if (proposal.status === "rejected") {
      return (
        <span className="project-status rejected-status d-flex align-items-center py-2 px-3" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
          <X size={14} className="me-1" /> Rejected
        </span>
      );
    }

    if (iWaitingForReply(proposal)) {
      return (
        <>
          <span className="text-muted small fst-italic me-auto">
            Waiting for expert response…
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning px-3 py-2 fw-semibold"
            style={{ borderRadius: "8px" }}
            onClick={(e) => { e.stopPropagation(); setSelectedProposal(proposal); openCounterForm(); }}
            disabled={busy}
          >
            Counter Again
          </button>
        </>
      );
    }

    if (isMyTurnToRespond(proposal)) {
      return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-sm btn-success fw-semibold px-3 py-2"
            style={{ borderRadius: "8px" }}
            onClick={(e) => { e.stopPropagation(); handleAcceptProposal(pid); }}
            disabled={busy}
          >
            {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : <Check size={14} className="me-1" />}
            Approve Counter
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning fw-semibold px-3 py-2"
            style={{ borderRadius: "8px" }}
            onClick={(e) => { e.stopPropagation(); setSelectedProposal(proposal); openCounterForm(); }}
            disabled={busy}
          >
            Counter Again
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger fw-semibold px-3 py-2"
            style={{ borderRadius: "8px" }}
            onClick={(e) => { e.stopPropagation(); handleRejectProposal(pid); }}
            disabled={busy}
          >
            <X size={14} className="me-1" />
            Reject
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-sm btn-success fw-semibold px-3 py-2"
          style={{ borderRadius: "8px" }}
          onClick={(e) => { e.stopPropagation(); handleAcceptProposal(pid); }}
          disabled={busy}
        >
          {busy ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : <Check size={14} className="me-1" />}
          Approve Proposal
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-warning fw-semibold px-3 py-2"
          style={{ borderRadius: "8px" }}
          onClick={(e) => { e.stopPropagation(); setSelectedProposal(proposal); openCounterForm(); }}
          disabled={busy}
        >
          <RefreshCcw size={14} className="me-1" />
          Counter Offer
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger fw-semibold px-3 py-2"
          style={{ borderRadius: "8px" }}
          onClick={(e) => { e.stopPropagation(); handleRejectProposal(pid); }}
          disabled={busy}
        >
          <X size={14} className="me-1" />
          Reject
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary fw-semibold px-3 py-2"
          style={{ borderRadius: "8px" }}
          onClick={(e) => { e.stopPropagation(); handleContactExpert(proposal); }}
        >
          <Mail size={14} className="me-1" />
          Message
        </button>
      </div>
    );
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="market-client-layout expert-projects-client-style">
      <ClientSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={() => navigate("/")} />

      <main className="post-job-main">
        <header className="post-job-header" style={{ marginBottom: "24px" }}>
          <button
            type="button"
            className="back-circle"
            onClick={() => navigate("/client/projects")}
          >
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1>Task Details</h1>
            <p>Review job post details, expert proposals, and contract status.</p>
          </div>
        </header>

        {loading && <div className="alert alert-success" style={{ marginBottom: "24px" }}>Loading task details...</div>}
        {error && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{error}</div>}

        {!loading && !error && job && (
          <>
            {job.status === 'removed' && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                <strong>Warning:</strong> This task has been removed by the administrator due to policy violations. You cannot perform any actions on this task.
              </div>
            )}

            {/* ── 2-COLUMN GRID LAYOUT (matching ServiceRequestDetailPage) ── */}
            <div className="task-detail-grid" style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: "30px", alignItems: "start" }}>
              
              {/* LEFT COLUMN: JOB OVERVIEW & PROPOSALS */}
              <div className="d-flex flex-column gap-4">
                
                {/* 1. Job details context card */}
                <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                    <div>
                      <span className={`project-status ${job.status === 'removed' ? 'rejected-status' : ''}`} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", marginRight: "8px", textTransform: "capitalize" }}>
                        {job.status === 'removed' ? 'Removed by Admin' : (job.status || "Open Task")}
                      </span>
                      <h2 style={{ margin: "12px 0 0 0", color: "#fff", fontSize: "1.4rem", fontWeight: "600" }}>
                        {job.title || job.jobTitle || "Untitled Task"}
                      </h2>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {job.status === "pending" && (
                        <button
                          className="btn btn-success fw-bold"
                          style={{ borderRadius: "8px", padding: "8px 16px", backgroundColor: "#10b981", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                          type="button"
                          onClick={handleCreateProjectFromPending}
                          disabled={loading}
                        >
                          <Play size={16} />
                          Start Project
                        </button>
                      )}
                      <button
                        className="draft-btn"
                        type="button"
                        onClick={fetchDetail}
                        disabled={loading}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <RefreshCcw size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {job.description || "No description provided."}
                  </p>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", gap: "24px", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", flexWrap: "wrap" }}>
                    <span>Budget Range: <strong style={{ color: "#fff" }}>{formatBudget(job)}</strong></span>
                    <span>Duration: <strong style={{ color: "#fff" }}>{formatDuration(job.duration_days)}</strong></span>
                    <span>Proposals: <strong style={{ color: "#fff" }}>{proposalCount}</strong></span>
                    {job.category && <span>Category: <strong style={{ color: "#fff" }}>{job.category}</strong></span>}
                  </div>
                </article>

                {/* 2. Proposals & Negotiation Card */}
                <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ color: "#fff", fontSize: "1.2rem", margin: 0, fontWeight: "600" }}>Expert Proposals</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                        Proposals are analyzed by AI and ordered by suitability. Click any proposal to view full details.
                      </p>
                    </div>
                    {proposals.length > 0 && (
                      <button
                        className="ai-reanalyze-btn"
                        onClick={handleReanalyzeProposals}
                        disabled={isAnalyzing}
                        title="Trigger AI to re-evaluate and score all proposals for this task"
                      >
                        <Sparkles size={16} className={isAnalyzing ? "animate-spin" : ""} />
                        {isAnalyzing ? "Analyzing with AI..." : "Re-analyze with AI"}
                      </button>
                    )}
                  </div>

                  {analysisFeedback && (
                    <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(168, 85, 247, 0.35)", color: "#c7d2fe", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Sparkles size={16} color="#a78bfa" />
                      <span>{analysisFeedback}</span>
                    </div>
                  )}

                  {sortedProposals.length === 0 ? (
                    <div className="empty-projects" style={{ padding: "40px 20px", textAlign: "center" }}>
                      <MessageSquare size={42} style={{ color: "rgba(255,255,255,0.3)", marginBottom: "12px" }} />
                      <h3 style={{ color: "#fff", fontSize: "1.1rem" }}>No proposals yet</h3>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Once experts send proposals, they will appear here for your review.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                      {sortedProposals.map((proposal, index) => {
                        const pid = proposal._id || proposal.id || index;
                        const hasScore = typeof proposal.ai_match_score === "number";
                        const isRecommended = hasScore && proposal.ai_match_score >= 80;

                        return (
                          <div
                            key={pid}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              background: "rgba(255, 255, 255, 0.02)",
                              border: isRecommended ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: "12px",
                              padding: "22px",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {/* Proposal Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "16px", width: "100%", flexWrap: "wrap" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                                  <UserRound size={24} color="#fff" />
                                </div>
                                <div>
                                  <h4 
                                    onClick={() => navigate(`/profile/${getProposalExpertId(proposal)}`)}
                                    style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: "600", cursor: "pointer" }}
                                  >
                                    {getExpertName(proposal)}
                                  </h4>
                                  <p style={{ margin: "2px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                                    {proposal?.expert?.professionalTitle || proposal.professional_title || "AI Expert"}
                                  </p>
                                </div>
                              </div>

                              {/* Badges */}
                              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                                {isRecommended && (
                                  <span className="recommended-badge" style={{ padding: "4px 12px", fontSize: "0.75rem" }}>
                                    <Sparkles size={12} /> Recommended
                                  </span>
                                )}
                                {hasScore && (
                                  <span className={`ai-score-pill ${proposal.ai_match_score >= 80 ? "score-high" : proposal.ai_match_score >= 60 ? "score-medium" : "score-low"}`} style={{ padding: "4px 12px", fontSize: "0.75rem" }}>
                                    <Sparkles size={12} /> {proposal.ai_match_score}% Match
                                  </span>
                                )}
                                <span style={{
                                  display: "inline-block",
                                  padding: "4px 14px",
                                  borderRadius: "20px",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  background: statusColor(proposal.status) + "22",
                                  color: statusColor(proposal.status),
                                  border: `1px solid ${statusColor(proposal.status)}44`,
                                  textTransform: "capitalize"
                                }}>
                                  {proposal.status === "countered" && isMyTurnToRespond(proposal) ? "Counter Received" : proposal.status || "pending"}
                                </span>
                              </div>
                            </div>

                            {/* Counter Offer Highlight Banner */}
                            {proposal.status === "countered" && (
                              <div
                                style={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                  background: isMyTurnToRespond(proposal) ? "rgba(16, 185, 129, 0.08)" : "rgba(59, 130, 246, 0.08)",
                                  border: `1px solid ${isMyTurnToRespond(proposal) ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"}`,
                                  borderRadius: "8px",
                                  padding: "14px",
                                  marginBottom: "16px",
                                  color: "#fff",
                                }}
                              >
                                <h5 style={{ margin: "0 0 6px 0", fontWeight: "600", fontSize: "0.9rem", color: isMyTurnToRespond(proposal) ? "#10b981" : "#3b82f6" }}>
                                  {isMyTurnToRespond(proposal) ? "Counter-proposal Received" : "Counter-proposal Sent"}
                                </h5>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "6px" }}>
                                  <div>
                                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER BID AMOUNT</span>
                                    <strong style={{ display: "block", fontSize: "1rem", color: "#fff" }}>
                                      ${proposal.counter_bid_amount}
                                    </strong>
                                  </div>
                                  <div>
                                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER DELIVERY</span>
                                    <strong style={{ display: "block", fontSize: "1rem", color: "#fff" }}>
                                      {proposal.counter_delivery_days ? `${proposal.counter_delivery_days} Days` : "N/A"}
                                    </strong>
                                  </div>
                                  {proposal.counter_cover_letter && (
                                    <div style={{ gridColumn: "span 2" }}>
                                      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER MESSAGE</span>
                                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.8)" }}>
                                        {proposal.counter_cover_letter}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Cover Letter / Message Box */}
                            <div style={{ marginBottom: "16px", width: "100%" }}>
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: "600", textTransform: "uppercase" }}>Cover Letter</span>
                              <p style={{ margin: "6px 0 0 0", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)", padding: "14px 16px", borderRadius: "8px", whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.85)", fontSize: "0.92rem", lineHeight: 1.5, maxHeight: "140px", overflowY: "auto", width: "100%", boxSizing: "border-box" }}>
                                {proposal.coverLetter || proposal.cover_letter || proposal.message || "No cover letter provided."}
                              </p>
                            </div>

                            {/* Proposed Metrics & Actions Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", width: "100%" }}>
                              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                                <div>
                                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>PROPOSED BID</span>
                                  <strong style={{ display: "flex", alignItems: "center", fontSize: "1.15rem", color: "#fff", marginTop: "2px" }}>
                                    <DollarSign size={16} className="text-primary me-1" />
                                    {proposal.bid_amount ? `$${proposal.bid_amount}` : "N/A"}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>DELIVERY</span>
                                  <strong style={{ display: "flex", alignItems: "center", fontSize: "1.15rem", color: "#fff", marginTop: "2px" }}>
                                    <Clock size={16} className="text-primary me-1" />
                                    {proposal.delivery_days ? `${proposal.delivery_days} Days` : "N/A"}
                                  </strong>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-light"
                                  style={{ borderRadius: "8px", fontSize: "0.85rem", padding: "7px 16px", color: "rgba(255,255,255,0.8)" }}
                                  onClick={() => { setSelectedProposal(proposal); setShowCounterForm(false); }}
                                >
                                  View Details
                                </button>
                                {renderProposalActions(proposal)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              </div>

              {/* RIGHT SIDEBAR: TASK STATUS & HIGHLIGHTS */}
              <aside className="post-form-card task-proposal-summary" style={{ display: "flex", flexDirection: "column", gap: "20px", background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>TASK STATUS</span>
                  <div style={{ marginTop: "8px" }}>
                    <span className={`project-status ${job.status === 'removed' ? 'rejected-status' : (job.status || 'open')}`} style={{ fontSize: "1rem", padding: "6px 16px", borderRadius: "20px", display: "inline-block", textTransform: "capitalize" }}>
                      {job.status === 'removed' ? 'Removed by Admin' : (job.status || "open")}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>BUDGET RANGE</span>
                  <strong style={{ display: "block", fontSize: "1.4rem", color: "#fff", marginTop: "4px" }}>
                    {formatBudget(job)}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESTIMATED DURATION</span>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff", marginTop: "4px" }}>
                    {formatDuration(job.duration_days)}
                  </strong>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>TOTAL PROPOSALS</span>
                  <strong style={{ display: "block", fontSize: "1.4rem", color: "#fff", marginTop: "4px" }}>
                    {proposalCount}
                  </strong>
                </div>

                {/* Accepted proposal & escrow details */}
                {acceptedProposal && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ACCEPTED EXPERT</span>
                    <div style={{ marginTop: "6px" }}>
                      <strong 
                        onClick={() => navigate(`/profile/${getProposalExpertId(acceptedProposal)}`)}
                        style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem", fontWeight: "600" }}
                      >
                        {getExpertName(acceptedProposal)}
                      </strong>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESCROW PAYMENT</span>
                      {acceptedProposal.payment_status === "funded" ? (
                        <div style={{ marginTop: "8px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "12px" }}>
                          <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.85rem" }}>✓ Funds Secured in Escrow</span>
                          <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                            Escrow fully funded.
                          </p>
                        </div>
                      ) : (
                        <div style={{ marginTop: "8px" }}>
                          <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                            <span style={{ color: "#f59e0b", fontWeight: "600", fontSize: "0.85rem" }}>⚠ Payment Required</span>
                            <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                              Fund the escrow to lock in contract terms and start the project.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAcceptProposal(acceptedProposal._id || acceptedProposal.id)}
                            disabled={Boolean(actingProposal)}
                            style={{ width: "100%", background: "linear-gradient(to right, #6366f1, #4f46e5)", border: "none", borderRadius: "8px", padding: "10px 16px", color: "#fff", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
                          >
                            {actingProposal ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                            Pay ${acceptedProposal.bid_amount} Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </aside>

            </div>

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

                    {/* AI Suitability Match Card */}
                    {typeof selectedProposal.ai_match_score === "number" && (
                      <div className="ai-analysis-modal-card" style={{ marginBottom: "20px" }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <Sparkles size={16} color={selectedProposal.ai_match_score >= 80 ? "#34d399" : "#fbbf24"} />
                            <span className="fw-bold text-white" style={{ fontSize: "0.95rem" }}>
                              AI Suitability Match: {selectedProposal.ai_match_score}%
                            </span>
                          </div>
                          {selectedProposal.ai_match_score >= 80 && (
                            <span className="recommended-badge" style={{ padding: "3px 10px", fontSize: "0.72rem" }}>
                              <Sparkles size={10} /> Recommended Match
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="ai-progress-track">
                          <div
                            className={`ai-progress-fill ${
                              selectedProposal.ai_match_score >= 80 ? "high" : selectedProposal.ai_match_score >= 60 ? "medium" : "low"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, selectedProposal.ai_match_score))}%` }}
                          />
                        </div>

                        {/* AI Match Reason Text */}
                        {selectedProposal.ai_match_reason && (
                          <p className="m-0 text-light" style={{ fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.55 }}>
                            <strong style={{ color: "#a5b4fc" }}>Analysis: </strong>
                            {selectedProposal.ai_match_reason}
                          </p>
                        )}
                      </div>
                    )}

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

                    {/* Counter-proposal info */}
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

                    {/* ── Counter-offer form (inline) ── */}
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
                            {actingProposal ? <Loader2 className="animate-spin me-1 d-inline" size={14} /> : <Send size={14} className="me-1" />}
                            Send Counter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer action buttons */}
                  <div className="d-flex gap-2 justify-content-end flex-wrap pt-3 border-top border-secondary border-opacity-25 mt-2">
                    {renderProposalActions(selectedProposal)}
                  </div>
                </div>
              </div>
            )}

            {/* ── Start Project? prompt ────────────────────────────── */}
            <PaymentSourceDialog
              open={Boolean(paymentProposal)}
              title={paymentProposal ? `Fund proposal from ${getExpertName(paymentProposal)}` : ''}
              amount={paymentProposal?.status === 'countered' && paymentProposal?.counter_bid_amount ? paymentProposal.counter_bid_amount : paymentProposal?.bid_amount}
              availableBalance={job?.client_budget ?? job?.clientBudget}
              busy={Boolean(actingProposal)}
              onClose={() => !actingProposal && setPaymentProposal(null)}
              onSelect={handlePaymentSource}
            />

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

