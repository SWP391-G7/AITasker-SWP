import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  RefreshCcw,
  Send,
  X,
  BriefcaseBusiness
} from "lucide-react";
import ClientSidebar from "../../Components/Dashboard/Client/ClientSidebar";
import ExpertSidebar from "../../Components/Dashboard/Expert/ExpertSidebar";
import Footer from "../../Components/Footer/Footer";
import {
  getInvitationById,
  updateInvitationStatus,
  counterInvitation,
  startProjectFromInvitation,
  initiateInvitationPayment
} from "../../Services/invitationService";
import { getStoredUser } from "../../Services/checkLogin";
import "../DashboardPage/Style/AdminDashboardPage.css";
import "../DashboardPage/Style/ExpertDashboardPage.css";
import "../DashboardPage/Client/ClientMarketplace.css";

const parseMoney = (value) => Number(String(value || '0').replace(/[^0-9.]/g, '')) || 0;
const formatMoney = (value) => `$${parseMoney(value).toLocaleString()}`;

function ServiceRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Countering state (for when countering a proposal)
  const [isCountering, setIsCountering] = useState(false);
  const [counterForm, setCounterForm] = useState({
    bidAmount: "",
    deliveryDays: "",
    coverLetter: "",
  });

  const currentUser = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  const isExpert = currentUser?.role === 'expert';

  const fetchRequestDetail = useCallback(async () => {
    if (!id) {
      setError("Request ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setActionError("");
      const data = await getInvitationById(id);
      setInvitation(data);

      // Pre-fill counter form
      setCounterForm({
        bidAmount: data.counter_bid_amount || data.bid_amount || "",
        deliveryDays: data.counter_delivery_days || data.delivery_days || "",
        coverLetter: "",
      });
    } catch (err) {
      setError(err.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  // Handle payment redirect back to this page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const errorMsg = params.get("error");

    if (paymentStatus === "success") {
      // Clear the query params and refresh data to reflect paid_at update
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchRequestDetail();
    } else if (paymentStatus === "failed" && errorMsg) {
      setError("Payment failed: " + decodeURIComponent(errorMsg));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tabId) => {
    if (isExpert) {
      if (tabId === "dashboard") navigate("/expert/dashboard");
      else navigate(`/expert/${tabId}`);
    } else {
      if (tabId === "dashboard") navigate("/client/dashboard");
      else navigate(`/client/${tabId}`);
    }
  };

  // Determine if it is this user's turn to respond to a counter
  const isMyTurn = useMemo(() => {
    if (!invitation || !currentUser) return false;
    const status = invitation.status;
    if (status === 'pending') {
      return isExpert; // Expert's turn to respond to client's initial request
    }
    if (status === 'countered') {
      return invitation.counter_initiated_by !== currentUser.id;
    }
    return false;
  }, [invitation, isExpert, currentUser]);

  const showPayNowButton = useMemo(() => {
    if (!invitation) return false;
    // Client can pay when expert has accepted but payment hasn't been made yet
    return !isExpert && invitation.status === 'accepted' && !invitation.paid_at;
  }, [invitation, isExpert]);

  const showStartProjectButton = useMemo(() => {
    if (!invitation) return false;
    // Client can start project once payment has been made (paid_at is set)
    return !isExpert && invitation.status === 'accepted' && !!invitation.paid_at;
  }, [invitation, isExpert]);

  // Handle Accept request or counter offer
  const handleAccept = async () => {
    if (!invitation) return;
    const ok = window.confirm("Are you sure you want to approve this request/counter?");
    if (!ok) return;

    try {
      setSubmitting(true);
      setActionError("");
      const res = await updateInvitationStatus({
        invitationId: invitation.id,
        status: "accepted",
      });
      if (res.project) {
        alert("Request accepted and project contract successfully initialized!");
        navigate(`/projects/${res.project.id}`);
      } else {
        alert("Request approved! The client will now be prompted to fund the escrow.");
        fetchRequestDetail();
      }
    } catch (err) {
      setActionError(err.message || "Failed to approve request.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle client initiating payment (escrow deposit)
  const handlePayNow = async () => {
    if (!invitation) return;
    setSubmitting(true);
    setActionError("");
    try {
      const result = await initiateInvitationPayment(invitation.id);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("Failed to generate payment redirect link");
      }
    } catch (err) {
      setActionError(err.message || "Failed to initiate payment session");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Decline request or counter offer
  const handleDecline = async () => {
    if (!invitation) return;
    const ok = window.confirm("Are you sure you want to decline this request?");
    if (!ok) return;

    try {
      setSubmitting(true);
      setActionError("");
      await updateInvitationStatus({
        invitationId: invitation.id,
        status: "rejected",
      });
      alert("Request declined.");
      fetchRequestDetail();
    } catch (err) {
      setActionError(err.message || "Failed to decline request.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle counter submit
  const handleSendCounter = async (e) => {
    e.preventDefault();
    if (!invitation) return;

    const bid = Number(counterForm.bidAmount);
    const days = Number(counterForm.deliveryDays);

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
      await counterInvitation({
        invitationId: invitation.id,
        bidAmount: bid,
        deliveryDays: days,
        coverLetter: counterForm.coverLetter,
      });
      setIsCountering(false);
      alert("Counter-proposal sent successfully!");
      fetchRequestDetail();
    } catch (err) {
      setActionError(err.message || "Failed to send counter-proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Client start project
  const handleStartProject = async () => {
    if (!window.confirm("Are you ready to fund and start this project contract?")) return;

    try {
      setSubmitting(true);
      setActionError("");
      const project = await startProjectFromInvitation(invitation.id);
      alert("Project contract successfully started!");
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setActionError(err.message || "Failed to start project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="market-client-layout expert-projects-client-style">
      {isExpert ? (
        <ExpertSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={() => navigate("/")} />
      ) : (
        <ClientSidebar activeTab="projects" onTabChange={handleTabChange} onLogout={() => navigate("/")} />
      )}

      <main className="post-job-main">
        <header className="post-job-header" style={{ marginBottom: "24px" }}>
          <button
            type="button"
            className="back-circle"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={26} />
          </button>

          <div>
            <h1>Request Details</h1>
            <p>Review and negotiate service purchase terms and contract status.</p>
          </div>
        </header>

        {error && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{error}</div>}
        {actionError && <div className="alert alert-danger" style={{ marginBottom: "24px" }}>{actionError}</div>}
        {loading && <div className="alert alert-success" style={{ marginBottom: "24px" }}>Loading request details...</div>}

        {!loading && !error && invitation && (
          <div className="task-detail-grid" style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: "30px", alignItems: "start" }}>
            
            {/* LEFT SIDE: DETAILS & FORMS */}
            <div className="d-flex flex-column gap-4">
              
              {/* Service details context */}
              <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <span className="project-status" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", marginRight: "8px" }}>
                      Requested Service
                    </span>
                    <h2 style={{ margin: "12px 0 0 0", color: "#fff", fontSize: "1.4rem", fontWeight: "600" }}>
                      {invitation.service_title || "Untitled Service"}
                    </h2>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {showPayNowButton && (
                      <button
                        className="btn fw-bold"
                        style={{ borderRadius: "8px", padding: "8px 16px", background: "linear-gradient(to right, #6366f1, #4f46e5)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
                        type="button"
                        onClick={handlePayNow}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        Pay Now
                      </button>
                    )}
                    {showStartProjectButton && (
                      <button
                        className="btn btn-success fw-bold"
                        style={{ borderRadius: "8px", padding: "8px 16px", backgroundColor: "#10b981", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        type="button"
                        onClick={handleStartProject}
                        disabled={submitting}
                      >
                        Create Project
                      </button>
                    )}
                    <button
                      className="draft-btn"
                      type="button"
                      onClick={fetchRequestDetail}
                      disabled={submitting}
                      style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <RefreshCcw size={16} />
                      Refresh
                    </button>
                  </div>
                </div>
                <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {invitation.service_description || "No description provided."}
                </p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", gap: "24px", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
                  <span>Expert: <strong style={{ color: "#fff" }}>{invitation.expert_name || "Expert"}</strong></span>
                  <span>Client: <strong style={{ color: "#fff" }}>{invitation.client_name || "Client"}</strong></span>
                  <span>Service Catalog Price: <strong style={{ color: "#fff" }}>{formatMoney(invitation.service_price)}</strong></span>
                </div>
              </article>

              {/* Invitation values / forms */}
              <article className="post-form-card" style={{ background: "#0b1220", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "24px", borderRadius: "16px" }}>
                
                {/* 1. Normal View (Not countering) */}
                {!isCountering && (
                  <div>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px", fontWeight: "600" }}>Purchase Offer</h3>

                    {/* Counter history banner */}
                    {invitation.status === "countered" && (
                      <div
                        style={{
                          background: isMyTurn ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
                          border: `1px solid ${isMyTurn ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"}`,
                          borderRadius: "8px",
                          padding: "16px",
                          marginBottom: "24px",
                          color: "#fff",
                        }}
                      >
                        <h5 style={{ margin: "0 0 6px 0", fontWeight: "600", fontSize: "0.95rem", color: isMyTurn ? "#10b981" : "#3b82f6" }}>
                          {isMyTurn ? "Counter-proposal Received" : "Waiting for Response"}
                        </h5>
                        <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
                          {isMyTurn
                            ? "The other party proposed a new bid and delivery terms. Review details below."
                            : "You sent a counter-proposal. Waiting for the other party to respond."}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "6px" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER BID AMOUNT</span>
                            <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff" }}>
                              ${invitation.counter_bid_amount}
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER DELIVERY DAYS</span>
                            <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff" }}>
                              {invitation.counter_delivery_days} Days
                            </strong>
                          </div>
                          {invitation.counter_cover_letter && (
                            <div style={{ gridColumn: "span 2" }}>
                              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>COUNTER MESSAGE / COMMENTS</span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.8)" }}>
                                {invitation.counter_cover_letter}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Main request details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600", textTransform: "uppercase" }}>Describe Requirements</span>
                        <p style={{ margin: "8px 0 0 0", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
                          {invitation.cover_letter || "No instructions provided."}
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>BID AMOUNT</span>
                          <strong style={{ display: "flex", alignItems: "center", fontSize: "1.3rem", color: "#fff", marginTop: "4px" }}>
                            <DollarSign size={20} className="text-primary" />
                            {invitation.bid_amount}
                          </strong>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>DELIVERY TIMELINE</span>
                          <strong style={{ display: "flex", alignItems: "center", fontSize: "1.3rem", color: "#fff", marginTop: "4px" }}>
                            <Clock size={20} className="text-primary me-2" />
                            {invitation.delivery_days} Days
                          </strong>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginTop: "10px" }}>
                        {isMyTurn && (
                          <>
                            <button
                              type="button"
                              className="btn btn-success"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={handleAccept}
                              disabled={submitting}
                            >
                              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                              Accept Request
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={() => setIsCountering(true)}
                              disabled={submitting}
                            >
                              <RefreshCcw size={16} />
                              Make Counter Offer
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", fontWeight: "600", padding: "10px 20px" }}
                              onClick={handleDecline}
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

                {/* 2. Counter Offer Form */}
                {isCountering && (
                  <form onSubmit={handleSendCounter}>
                    <h3 style={{ color: "#fff", fontSize: "1.2rem", marginBottom: "20px", fontWeight: "600" }}>Counter Offer</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "20px" }}>
                      Submit a new bid amount, delivery days, and explanation. This will send a counter request to the other party.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div className="form-field">
                          <label>NEW BID AMOUNT ($)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={counterForm.bidAmount}
                            onChange={(e) => setCounterForm(prev => ({ ...prev, bidAmount: e.target.value }))}
                            placeholder="e.g. 950"
                          />
                        </div>
                        <div className="form-field">
                          <label>DELIVERY TIMELINE (DAYS)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={counterForm.deliveryDays}
                            onChange={(e) => setCounterForm(prev => ({ ...prev, deliveryDays: e.target.value }))}
                            placeholder="e.g. 10"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>COMMENTS / REASON FOR CHANGE</label>
                        <textarea
                          required
                          value={counterForm.coverLetter}
                          onChange={(e) => setCounterForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                          rows={4}
                          placeholder="Explain why you are offering this counter bid (e.g. scope change, required timeline adjustment...)"
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
                          onClick={() => setIsCountering(false)}
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
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>REQUEST STATUS</span>
                <div style={{ marginTop: "8px" }}>
                  <span className={`project-status ${invitation.status}`} style={{ fontSize: "1rem", padding: "6px 16px", borderRadius: "20px", display: "inline-block", textTransform: "capitalize" }}>
                    {invitation.status || "pending"}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>BID AMOUNT</span>
                <strong style={{ display: "block", fontSize: "1.4rem", color: "#fff", marginTop: "4px" }}>
                  ${invitation.bid_amount}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESTIMATED DURATION</span>
                <strong style={{ display: "block", fontSize: "1.1rem", color: "#fff", marginTop: "4px" }}>
                  {invitation.delivery_days} Days
                </strong>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>PARTICIPANTS</span>
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ fontSize: "0.8rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Client: </span>
                    <strong 
                      onClick={() => navigate(`/profile/${invitation.client_id}`)}
                      style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem", display: "inline", margin: 0, fontWeight: "600" }}
                    >
                      {invitation.client_name}
                    </strong>
                  </div>
                  <div style={{ fontSize: "0.8rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Expert: </span>
                    <strong 
                      onClick={() => navigate(`/profile/${invitation.expert_id}`)}
                      style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem", display: "inline", margin: 0, fontWeight: "600" }}
                    >
                      {invitation.expert_name}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment status section (only when accepted) */}
              {invitation.status === 'accepted' && !isExpert && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESCROW PAYMENT</span>
                  {invitation.paid_at ? (
                    <div style={{ marginTop: "8px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", padding: "12px" }}>
                      <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.85rem" }}>✓ Funds Secured in Escrow</span>
                      <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                        Paid on {new Date(invitation.paid_at).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                        <span style={{ color: "#f59e0b", fontWeight: "600", fontSize: "0.85rem" }}>⚠ Payment Required</span>
                        <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                          The expert has accepted. Fund the escrow to start the project.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={submitting}
                        style={{ width: "100%", background: "linear-gradient(to right, #6366f1, #4f46e5)", border: "none", borderRadius: "8px", padding: "10px 16px", color: "#fff", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                        Pay ${invitation.bid_amount} Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {invitation.status === 'accepted' && isExpert && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: "600" }}>ESCROW PAYMENT</span>
                  <div style={{ marginTop: "8px", background: invitation.paid_at ? "rgba(16, 185, 129, 0.08)" : "rgba(59, 130, 246, 0.08)", border: `1px solid ${invitation.paid_at ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)"}`, borderRadius: "8px", padding: "12px" }}>
                    <span style={{ color: invitation.paid_at ? "#10b981" : "#3b82f6", fontWeight: "600", fontSize: "0.85rem" }}>
                      {invitation.paid_at ? "✓ Payment Received" : "⏳ Awaiting Client Payment"}
                    </span>
                    <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                      {invitation.paid_at
                        ? `Client funded escrow on ${new Date(invitation.paid_at).toLocaleDateString()}`
                        : "The client needs to complete the escrow payment before the project can start."}
                    </p>
                  </div>
                </div>
              )}
            </aside>


          </div>
        )}

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ServiceRequestDetailPage;


