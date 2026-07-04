import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  DollarSign,
  Edit,
  Loader2,
  RefreshCcw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import ExpertSidebar from "../../../Components/Dashboard/Expert/ExpertSidebar";
import Footer from "../../../Components/Footer/Footer";
import { createHandleLogout } from "./handleLogout";
import {
  getProposalById,
  updateProposal,
  deleteProposal,
  updateProposalStatus,
  counterProposal,
} from "../../../Services/proposalService";
import "../../Style/AdminDashboardPage.css";
import "../../Style/ExpertDashboardPage.css";
import "../Client/ClientMarketplace.css";

function ExpertProposalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Editing state (for when the expert is editing their sent proposal)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bidAmount: "",
    coverLetter: "",
    deliveryDays: "",
  });

  // Re-bidding/Countering state (for when countering a client's counter-proposal)
  const [isRebidding, setIsRebidding] = useState(false);
  const [rebidForm, setRebidForm] = useState({
    bidAmount: "",
    coverLetter: "",
  });

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = createHandleLogout(navigate);

  const fetchProposalDetail = useCallback(async () => {
    if (!id) {
      setError("Proposal ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setActionError("");
      const data = await getProposalById(id);
      setProposal(data);

      // Pre-fill forms
      setEditForm({
        bidAmount: data.bid_amount || "",
        coverLetter: data.cover_letter || "",
        deliveryDays: data.delivery_days || "",
      });

      setRebidForm({
        bidAmount: data.counter_bid_amount || data.bid_amount || "",
        coverLetter: "",
      });
    } catch (err) {
      setError(err.message || "Failed to load proposal details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProposalDetail();
  }, [fetchProposalDetail]);

  const handleTabChange = (tabId) => {
    if (tabId === "dashboard") navigate("/expert/dashboard");
    else navigate(`/expert/${tabId}`);
  };

  // Determine if the proposal's active turn belongs to the expert (sent by client)
  const isClientCounter = useMemo(() => {
    if (!proposal || !user) return false;
    return (
      proposal.status === "countered" &&
      proposal.counter_initiated_by !== user.id
    );
  }, [proposal, user]);

  // Determine if the latest change was sent by the expert (either pending or countered by expert)
  const isExpertLatest = useMemo(() => {
    if (!proposal || !user) return false;
    return (
      proposal.status === "pending" ||
      (proposal.status === "countered" &&
        proposal.counter_initiated_by === user.id)
    );
  }, [proposal, user]);

  // Handle Approve/Accept client's counter-proposal
  const handleAcceptCounter = async () => {
    if (!proposal) return;
    const ok = window.confirm("Are you sure you want to approve this counter-proposal?");
    if (!ok) return;

    try {
      setSubmitting(true);
      setActionError("");
      await updateProposalStatus({
        proposalId: proposal.id,
        status: "accepted",
      });
      alert("Counter-proposal approved successfully!");
      fetchProposalDetail();
    } catch (err) {
      setActionError(err.message || "Failed to approve counter-proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Decline/Reject client's counter-proposal
  const handleDeclineCounter = async () => {
    if (!proposal) return;
    const ok = window.confirm("Are you sure you want to decline this counter-proposal?");
    if (!ok) return;

    try {
      setSubmitting(true);
      setActionError("");
      await updateProposalStatus({
        proposalId: proposal.id,
        status: "rejected",
      });
      alert("Counter-proposal declined.");
      fetchProposalDetail();
    } catch (err) {
      setActionError(err.message || "Failed to decline counter-proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle saving edits to expert's sent proposal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!proposal) return;

    const bid = Number(editForm.bidAmount);
    const days = Number(editForm.deliveryDays);

    if (isNaN(bid) || bid <= 0) {
      setActionError("Please enter a valid bid amount.");
      return;
    }
    if (isNaN(days) || days <= 0 || !Number.isInteger(days)) {
      setActionError("Please enter a valid integer for delivery days.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");
      await updateProposal({
        proposalId: proposal.id,
        coverLetter: editForm.coverLetter,
        bidAmount: bid,
        deliveryDays: days,
      });
      setIsEditing(false);
      alert("Proposal updated successfully!");
      fetchProposalDetail();
    } catch (err) {
      setActionError(err.message || "Failed to update proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting expert's sent proposal
  const handleDeleteProposal = async () => {
    if (!proposal) return;
    const ok = window.confirm(
      "Are you sure you want to delete this proposal? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      setActionError("");
      await deleteProposal(proposal.id);
      alert("Proposal deleted successfully.");
      navigate("/expert/projects");
    } catch (err) {
      setActionError(err.message || "Failed to delete proposal.");
      setSubmitting(false);
    }
  };

  // Handle submitting a counter back to the client
  const handleSendRebid = async (e) => {
    e.preventDefault();
    if (!proposal) return;

    const bid = Number(rebidForm.bidAmount);
    if (isNaN(bid) || bid <= 0) {
      setActionError("Please enter a valid bid amount.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");
      await counterProposal({
        proposalId: proposal.id,
        bidAmount: bid,
        coverLetter: rebidForm.coverLetter,
      });
      setIsRebidding(false);
      alert("Counter-proposal sent successfully!");
      fetchProposalDetail();
    } catch (err) {
      setActionError(err.message || "Failed to send counter-proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="market-client-layout expert-projects-client-style">
      <ExpertSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={handleLogout} />

      <main className="post-job-main">
        <header className="post-job-header" style={{ marginBottom: "24px" }}>
          <button
            type="button"
            className="back-circle"
            onClick={() => navigate("/expert/projects")}
          >
            <ArrowLeft size={26} />
          </button>

          <div>
            <h1>Proposal Details</h1>
            <p>Review and manage your proposal status and negotiations.</p>
          </div>
        </header>

        {error && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{error}</div>}
        {actionError && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{actionError}</div>}
        {loading && <div className="alert alert-success" style={{ marginBottom: "24px" }}>Loading proposal details...</div>}

        {!loading && !error && proposal && (
          <div className="task-detail-grid" style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: "30px", alignItems: "start" }}>
            
            {/* LEFT SIDE: DETAILS & FORMS */}
            <div className="d-flex flex-column gap-4">
              
              {/* Job post context */}
              <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <span className="project-status" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", marginRight: "8px" }}>
                      Job Post
                    </span>
                    <span className={`project-status ${proposal.job_status}`} style={{ textTransform: "capitalize" }}>
                      {proposal.job_status || "open"}
                    </span>
                    <h2 style={{ margin: "12px 0 0 0", color: "#fff", fontSize: "1.4rem", fontWeight: "600" }}>
                      {proposal.job_title || "Untitled Job Post"}
                    </h2>
                  </div>
                  <button
                    className="draft-btn"
                    type="button"
                    onClick={fetchProposalDetail}
                    disabled={submitting}
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
                <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {proposal.job_description || "No description provided."}
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", gap: "24px", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
                  <span>Client: <strong style={{ color: "#fff" }}>{proposal.client_name || "Client"}</strong></span>
                  <span>Job Duration: <strong style={{ color: "#fff" }}>{proposal.duration_days ? `${proposal.duration_days} Days` : "Flexible"}</strong></span>
                </div>
              </article>

              {/* Proposal values / forms */}
              <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                
                {/* 1. Normal View (Not editing or re-bidding) */}
                {!isEditing && !isRebidding && (
                  <div>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px", fontWeight: "600" }}>Your Sent Proposal</h3>

                    {/* Counter history banner */}
                    {proposal.status === "countered" && (
                      <div
                        style={{
                          background: isClientCounter ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                          border: `1px solid ${isClientCounter ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"}`,
                          borderRadius: "8px",
                          padding: "16px",
                          marginBottom: "24px",
                          color: "#fff",
                        }}
                      >
                        <h5 style={{ margin: "0 0 6px 0", fontWeight: "600", fontSize: "0.95rem", color: isClientCounter ? "#10b981" : "#3b82f6" }}>
                          {isClientCounter ? "Counter-proposal Received" : "Waiting for Client Response"}
                        </h5>
                        <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                          {isClientCounter
                            ? "The client proposed a new bid amount. Review details below."
                            : "You sent a counter-proposal. The client has not responded yet."}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "6px" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER BID AMOUNT</span>
                            <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff" }}>
                              ${proposal.counter_bid_amount}
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

                    {/* Main proposal details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600", textTransform: "uppercase" }}>Cover Letter</span>
                        <p style={{ margin: "8px 0 0 0", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                          {proposal.cover_letter || "No cover letter provided."}
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>BID AMOUNT</span>
                          <strong style={{ display: "flex", alignItems: "center", fontSize: "1.3rem", color: "#fff", marginTop: "4px" }}>
                            <DollarSign size={20} className="text-primary" />
                            {proposal.bid_amount}
                          </strong>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>DELIVERY TIMELINE</span>
                          <strong style={{ display: "flex", alignItems: "center", fontSize: "1.3rem", color: "#fff", marginTop: "4px" }}>
                            <Clock size={20} className="text-primary me-2" />
                            {proposal.delivery_days} Days
                          </strong>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginTop: "10px" }}>
                        {isExpertLatest && (proposal.status === "pending" || proposal.status === "countered") && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={() => setIsEditing(true)}
                              disabled={submitting}
                            >
                              <Edit size={16} />
                              Edit Proposal
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={handleDeleteProposal}
                              disabled={submitting}
                            >
                              <Trash2 size={16} />
                              Delete Proposal
                            </button>
                          </>
                        )}

                        {isClientCounter && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={handleAcceptCounter}
                              disabled={submitting}
                            >
                              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              Accept Counter
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={() => setIsRebidding(true)}
                              disabled={submitting}
                            >
                              <RefreshCcw size={16} />
                              Re-bid / Counter
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={handleDeclineCounter}
                              disabled={submitting}
                            >
                              <X size={16} />
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Edit Sent Proposal Form */}
                {isEditing && (
                  <form onSubmit={handleSaveEdit}>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px", fontWeight: "600" }}>Edit Proposal details</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div className="form-group">
                        <label>COVER LETTER</label>
                        <textarea
                          required
                          value={editForm.coverLetter}
                          onChange={(e) => setEditForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                          rows={6}
                          placeholder="Introduce yourself and explain your implementation plan..."
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div className="form-field">
                          <label>BID AMOUNT ($)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editForm.bidAmount}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                            placeholder="e.g. 1000"
                          />
                        </div>

                        <div className="form-field">
                          <label>DELIVERY TIMELINE (DAYS)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={editForm.deliveryDays}
                            onChange={(e) => setEditForm(prev => ({ ...prev, deliveryDays: e.target.value }))}
                            placeholder="e.g. 14"
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                        <button
                          type="submit"
                          className="btn btn-success"
                          style={{ borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                          disabled={submitting}
                        >
                          {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-light"
                          style={{ borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                          onClick={() => setIsEditing(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* 3. Re-bid / Counter Form */}
                {isRebidding && (
                  <form onSubmit={handleSendRebid}>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px", fontWeight: "600" }}>Counter Offer</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "20px" }}>
                      Submit a new bid amount and description to send back to the client. This will override the last counter.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div className="form-field">
                        <label>NEW BID AMOUNT ($)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={rebidForm.bidAmount}
                          onChange={(e) => setRebidForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                          placeholder="e.g. 950"
                        />
                      </div>

                      <div className="form-group">
                        <label>COUNTER LETTER / MESSAGE</label>
                        <textarea
                          required
                          value={rebidForm.coverLetter}
                          onChange={(e) => setRebidForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                          rows={4}
                          placeholder="Explain why you are offering this counter bid..."
                        />
                      </div>

                      <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                        <button
                          type="submit"
                          className="btn btn-success"
                          style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                          disabled={submitting}
                        >
                          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          Send Counter
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-light"
                          style={{ borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                          onClick={() => setIsRebidding(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

              </article>
            </div>

            {/* RIGHT SIDE: STATUS & HIGHLIGHTS */}
            <aside className="post-form-card task-proposal-summary" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>PROPOSAL STATUS</span>
                <div style={{ marginTop: "8px" }}>
                  <span className={`project-status ${proposal.status}`} style={{ fontSize: "1rem", padding: "6px 16px", borderRadius: "20px", display: "inline-block", textTransform: "capitalize" }}>
                    {proposal.status || "pending"}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ORIGINAL BID</span>
                <strong style={{ display: "block", fontSize: "1.4rem", color: "#fff", marginTop: "4px" }}>
                  ${proposal.bid_amount}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESTIMATED DURATION</span>
                <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff", marginTop: "4px" }}>
                  {proposal.delivery_days} Days
                </strong>
              </div>
            </aside>

          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ExpertProposalDetailPage;
