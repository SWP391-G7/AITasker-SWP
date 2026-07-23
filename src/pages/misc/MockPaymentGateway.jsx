/**
 * Frontend module: pages/misc/MockPaymentGateway.jsx
 *
 * Vai trò: Page Mock Payment Gateway: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Landmark, CheckCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

// React component “Mock Payment Gateway” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
function MockPaymentGateway() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Decoded payload state
  const [payload, setPayload] = useState(null);
  const [decodeError, setDecodeError] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeInput, setActiveInput] = useState(null); // 'number' | 'name' | 'expiry' | 'cvv'
  const requiresCard = Number(payload?.cardAmount ?? payload?.amount ?? 0) > 0;

  useEffect(() => {
    try {
      if (!token) {
        setDecodeError(true);
        return;
      }
      // Decode JWT token payload in frontend (Base64Url decode)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        setDecodeError(true);
        return;
      }
      const rawPayload = atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"));
      const parsed = JSON.parse(rawPayload);
      setPayload(parsed);
    } catch (err) {
      console.error("Failed to decode payment token:", err);
      setDecodeError(true);
    }
  }, [token]);

  // Card Number formatter: adds spaces every 4 characters
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Expiry formatter: adds slash MM/YY
  const handleExpiryChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    const previousDigits = expiry.replace(/\D/g, "");

    // Browsers may visually autofill an old expiry without updating React
    // state. If the user then types/pastes a new date, the DOM value can look
    // like 11231230. Keep the newly entered final four digits (1230), rather
    // than truncating back to the autofilled first four (1123).
    if (digits.length > 4) {
      const appendedDigits = previousDigits && digits.startsWith(previousDigits)
        ? digits.slice(previousDigits.length)
        : digits.slice(-4);
      digits = appendedDigits.length >= 4 ? appendedDigits.slice(-4) : digits.slice(-4);
    }

    const formatted = digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
      : digits;
    setExpiry(formatted);
  };

  // Handler “handle expiry focus” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleExpiryFocus = (e) => {
    setActiveInput("expiry");
    // Selecting the autofilled value makes the next typed date replace it.
    requestAnimationFrame(() => e.target.select());
  };

  // CVV input: 3 digits limit
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  // Handler “handle decline” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleDecline = () => {
    if (!payload) {
      navigate("/");
      return;
    }
    // Redirect back to the appropriate page based on payment type
    if (payload.type === 'invitation') {
      window.location.href = `/service-requests/${payload.invitationId}?payment=failed&error=Payment%20cancelled%20by%20client`;
    } else {
      window.location.href = `/client/projects/${payload.jobId}?payment=failed&error=Payment%20cancelled%20by%20client`;
    }
  };

  // Handler “handle submit” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    try {
      const response = await fetch(`${API_BASE_URL}/payment/mock-charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          cardNumber,
          cardHolder,
          expiry,
          cvv,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to process charge.");
      }

      setSuccess(true);
      // Wait 2 seconds, then redirect back to the client task page
      setTimeout(() => {
        window.location.href = result.redirectUrl;
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  if (decodeError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <AlertTriangle size={50} color="#f87171" style={{ marginBottom: "16px" }} />
          <h2 style={{ marginBottom: "12px", color: "#fff" }}>Invalid Checkout Session</h2>
          <p style={{ color: "#9ca3af", marginBottom: "24px", fontSize: "0.95rem" }}>
            The payment link is invalid, expired, or corrupted. Please return to the task page and accept the proposal again.
          </p>
          <button style={styles.backBtn} onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} color="#6366f1" />
        <span style={{ marginTop: "12px", color: "#9ca3af" }}>Verifying secure checkout session...</span>
      </div>
    );
  }

  return (
    <div style={styles.gatewayContainer}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <Landmark size={24} color="#6366f1" style={{ marginRight: "8px" }} />
          <span style={{ fontWeight: 800, letterSpacing: "1px", color: "#fff" }}>APEX</span>
          <span style={{ color: "#6366f1", fontWeight: 500 }}>ESCROW</span>
        </div>
        <div style={styles.headerSecure}>
          <ShieldCheck size={18} color="#10b981" style={{ marginRight: "4px" }} />
          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>SECURE 256-BIT ENCRYPTION</span>
        </div>
      </header>

      {success ? (
        <div style={styles.successWrapper}>
          <div style={styles.successCard}>
            <CheckCircle size={64} color="#10b981" style={{ marginBottom: "16px", animation: "scaleUp 0.3s ease" }} />
            <h2 style={{ color: "#fff", marginBottom: "12px", fontSize: "1.6rem" }}>Payment Successful!</h2>
            <p style={{ color: "#9ca3af", marginBottom: "16px", lineHeight: "1.5" }}>
              A total of <strong>${parseFloat(payload.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been secured in escrow.
            </p>
            <p style={{ color: "#6366f1", fontSize: "0.9rem", fontWeight: 500 }}>
              Redirecting you back to your workspace...
            </p>
          </div>
        </div>
      ) : (
        <main style={styles.mainLayout}>
          {/* Left panel: Payment form */}
          <section style={styles.formSection}>
            <button style={styles.cancelLink} onClick={handleDecline}>
              <ArrowLeft size={16} style={{ marginRight: "6px" }} />
              Cancel and Return
            </button>

            <h2 style={styles.sectionTitle}>{requiresCard ? 'Secure Payment Method' : 'Confirm Wallet Payment'}</h2>
            <p style={styles.sectionSubtitle}>{requiresCard ? 'Enter card details for the external portion of this escrow deposit.' : 'The full amount will be funded from your available wallet balance.'}</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              {requiresCard ? <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>CARDHOLDER NAME</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  onFocus={() => setActiveInput("name")}
                  onBlur={() => setActiveInput(null)}
                  style={{
                    ...styles.input,
                    borderColor: activeInput === "name" ? "#6366f1" : "rgba(255, 255, 255, 0.15)",
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>CARD NUMBER</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    required
                    placeholder="4111 1111 1111 1111"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setActiveInput("number")}
                    onBlur={() => setActiveInput(null)}
                    style={{
                      ...styles.input,
                      paddingLeft: "42px",
                      borderColor: activeInput === "number" ? "#6366f1" : "rgba(255, 255, 255, 0.15)",
                    }}
                  />
                  <CreditCard
                    size={20}
                    color="#9ca3af"
                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              </div>

              <div style={styles.rowInputs}>
                <div style={{ ...styles.inputGroup, flex: 1, marginRight: "16px" }}>
                  <label style={styles.label}>EXPIRY DATE</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    name="card-expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                    value={expiry}
                    onChange={handleExpiryChange}
                    onFocus={handleExpiryFocus}
                    onBlur={() => setActiveInput(null)}
                    style={{
                      ...styles.input,
                      borderColor: activeInput === "expiry" ? "#6366f1" : "rgba(255, 255, 255, 0.15)",
                    }}
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    onFocus={() => setActiveInput("cvv")}
                    onBlur={() => setActiveInput(null)}
                    style={{
                      ...styles.input,
                      borderColor: activeInput === "cvv" ? "#6366f1" : "rgba(255, 255, 255, 0.15)",
                    }}
                  />
                </div>
              </div>
              </> : (
                <div style={{ padding: '22px', borderRadius: '12px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.22)', color: '#d1fae5', lineHeight: 1.55 }}>
                  No card charge is required. Confirm below to move <strong>${parseFloat(payload.walletAmount || payload.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> from your available wallet balance into project escrow.
                </div>
              )}

              {errorMessage && <div style={styles.errorBanner}>{errorMessage}</div>}

              <div style={styles.actionButtons}>
                <button type="submit" disabled={loading} style={styles.payBtn}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} style={{ marginRight: "8px" }} />
                      Securing Funds...
                    </>
                  ) : (
                    requiresCard
                      ? `Pay $${parseFloat(payload.cardAmount ?? payload.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : `Confirm ${parseFloat(payload.amount).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`
                  )}
                </button>
                <button type="button" onClick={handleDecline} disabled={loading} style={styles.declineBtn}>
                  Decline / Cancel
                </button>
              </div>
            </form>

            {requiresCard && <div style={styles.alertNote}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#9ca3af", lineHeight: "1.4" }}>
                <strong>Sandbox cards:</strong> Use <code>4242 4242 4242 4242</code> for success, CVV <code>999</code> for a fraud decline, or <code>4111 1111 1111 1111</code> for insufficient funds. Other card numbers are rejected.
              </p>
            </div>}
          </section>

          {/* Right panel: Dynamic Card preview & Order details */}
          <section style={styles.previewSection}>
            {/* Visual Glassmorphic Card */}
            <div style={styles.glassCard}>
              <div style={styles.glassCardHeader}>
                <Landmark size={28} color="#fff" />
                <span style={{ fontSize: "0.95rem", fontWeight: 700, letterSpacing: "1px", color: "#fff" }}>APEX CARD</span>
              </div>
              <div style={styles.glassCardNumber}>
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
              <div style={styles.glassCardFooter}>
                <div>
                  <span style={styles.glassLabel}>CARDHOLDER</span>
                  <div style={styles.glassValue}>{cardHolder || "YOUR NAME HERE"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={styles.glassLabel}>EXPIRES</span>
                  <div style={styles.glassValue}>{expiry || "MM/YY"}</div>
                </div>
              </div>
            </div>

            {/* Escrow summary details */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Escrow Summary</h3>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Client Account</span>
                <span style={styles.summaryValue}>{payload.clientId ? "Verified Client" : "Unknown"}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>{payload.type === 'invitation' || payload.paymentKind === 'invitation' ? 'Service Request' : 'Associated Job'}</span>
                <span style={styles.summaryValue}>{payload.jobTitle || payload.serviceTitle || "Project"}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Wallet credit</span>
                <span style={styles.summaryValue}>${parseFloat(payload.walletAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Card charge</span>
                <span style={styles.summaryValue}>${parseFloat(payload.cardAmount ?? payload.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryTotalRow}>
                <span>Deposit Amount</span>
                <strong>${parseFloat(payload.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={styles.securedNotice}>
                <ShieldCheck size={18} color="#6366f1" style={{ marginRight: "6px" }} />
                <span>Escrow secured. Funds are disbursed only upon milestone delivery.</span>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

// Bespoke styling for stunning presentation
const styles = {
  gatewayContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
    color: "#ffffff",
    fontFamily: "'Inter', 'Outfit', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.2rem",
  },
  headerSecure: {
    display: "flex",
    alignItems: "center",
    background: "rgba(16, 185, 129, 0.08)",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  mainLayout: {
    display: "flex",
    flex: 1,
    padding: "40px",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    gap: "60px",
    alignItems: "flex-start",
  },
  formSection: {
    flex: 1.2,
  },
  previewSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    alignItems: "stretch",
  },
  cancelLink: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: "0.9rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 0,
    marginBottom: "24px",
    fontWeight: 500,
    transition: "color 0.2s",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "8px",
    background: "linear-gradient(to right, #ffffff, #9ca3af)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sectionSubtitle: {
    color: "#9ca3af",
    fontSize: "0.95rem",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "1px",
    color: "#9ca3af",
  },
  input: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.2s ease",
  },
  rowInputs: {
    display: "flex",
    justifyContent: "space-between",
  },
  errorBanner: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  actionButtons: {
    display: "flex",
    gap: "16px",
    marginTop: "12px",
  },
  payBtn: {
    flex: 2,
    background: "linear-gradient(to right, #6366f1, #4f46e5)",
    color: "#ffffff",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.25)",
    transition: "transform 0.2s, opacity 0.2s",
  },
  declineBtn: {
    flex: 1,
    background: "rgba(255, 255, 255, 0.05)",
    color: "#9ca3af",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  alertNote: {
    marginTop: "30px",
    padding: "16px",
    borderRadius: "10px",
    background: "rgba(99, 102, 241, 0.04)",
    border: "1px solid rgba(99, 102, 241, 0.15)",
  },
  // Right panel previews
  glassCard: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "30px",
    height: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
  glassCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  glassCardNumber: {
    fontSize: "1.4rem",
    fontWeight: 500,
    letterSpacing: "3px",
    color: "#fff",
    textAlign: "center",
    margin: "24px 0",
  },
  glassCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  glassLabel: {
    fontSize: "0.6rem",
    color: "#9ca3af",
    letterSpacing: "1px",
    display: "block",
    marginBottom: "4px",
  },
  glassValue: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "1px",
  },
  summaryCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "24px",
  },
  summaryTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "16px",
    color: "#fff",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    marginBottom: "12px",
  },
  summaryLabel: {
    color: "#9ca3af",
  },
  summaryValue: {
    color: "#ffffff",
    fontWeight: 500,
    textAlign: "right",
    maxWidth: "180px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  summaryDivider: {
    height: "1px",
    background: "rgba(255, 255, 255, 0.08)",
    margin: "16px 0",
  },
  summaryTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "20px",
  },
  securedNotice: {
    display: "flex",
    alignItems: "center",
    background: "rgba(99, 102, 241, 0.08)",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    fontSize: "0.8rem",
    color: "#a5b4fc",
    lineHeight: "1.4",
  },
  // Screen loader state
  loadingContainer: {
    minHeight: "100vh",
    background: "#0b0f19",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    minHeight: "100vh",
    background: "#0b0f19",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  errorCard: {
    background: "#111827",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "450px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  backBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 24px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  // Success state panel
  successWrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  successCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(20px)",
  },
};

export default MockPaymentGateway;
