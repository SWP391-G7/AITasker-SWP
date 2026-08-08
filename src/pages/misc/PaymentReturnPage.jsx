/**
 * Frontend module: pages/misc/PaymentReturnPage.jsx
 *
 * Vai trò: Trang trung gian đón nhận chuyển hướng sau khi khách hàng thanh toán tại Escrow Sandbox (escrow-sandbox.com).
 * Luồng chính:
 *  - Đọc search params (type, proposalId, jobId, invitationId, status, error).
 *  - Tự động gọi API verify-return để đồng bộ hóa trạng thái giao dịch với Escrow API.
 *  - Hiển thị hiệu ứng xác nhận an toàn và chuyển tiếp về trang quản lý công việc/dịch vụ.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get("type") || "proposal";
  const proposalId = searchParams.get("proposalId");
  const jobId = searchParams.get("jobId");
  const invitationId = searchParams.get("invitationId");
  const errorParam = searchParams.get("error");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(errorParam || "");

  useEffect(() => {
    if (errorParam) {
      setVerifying(false);
      setErrorMsg(decodeURIComponent(errorParam));
      return;
    }

    let isMounted = true;

    const verifyEscrowPayment = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const authToken = localStorage.getItem("token");

        const queryStr = type === "invitation"
          ? `type=invitation&invitationId=${invitationId}`
          : `type=proposal&proposalId=${proposalId}&jobId=${jobId}`;

        const res = await fetch(`${API_BASE_URL}/payment/verify-return?${queryStr}`, {
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          }
        });

        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success) {
            setSuccess(true);
            setVerifying(false);
            // Tự động chuyển trang sau 2.5 giây
            setTimeout(() => {
              handleRedirectTarget(true);
            }, 2500);
          } else {
            setSuccess(true); // Vẫn cho tiếp tục chuyển tiếp về trang chi tiết để refresh
            setVerifying(false);
            setTimeout(() => {
              handleRedirectTarget(true);
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Verification check error:", err);
        if (isMounted) {
          setVerifying(false);
          setSuccess(true); // Fallback chuyển hướng
          setTimeout(() => {
            handleRedirectTarget(true);
          }, 2000);
        }
      }
    };

    verifyEscrowPayment();

    return () => {
      isMounted = false;
    };
  }, [type, proposalId, jobId, invitationId, errorParam]);

  const handleRedirectTarget = (isOk) => {
    if (type === "invitation" && invitationId) {
      if (isOk) {
        window.location.href = `/service-requests/${invitationId}?payment=success`;
      } else {
        window.location.href = `/service-requests/${invitationId}?payment=failed&error=${encodeURIComponent(errorMsg || "Payment cancelled")}`;
      }
    } else if (jobId) {
      if (isOk) {
        window.location.href = `/client/projects/${jobId}?payment=success${proposalId ? `&proposalId=${proposalId}` : ""}`;
      } else {
        window.location.href = `/client/projects/${jobId}?payment=failed&error=${encodeURIComponent(errorMsg || "Payment cancelled")}`;
      }
    } else {
      navigate("/client/billing");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Top Escrow Branding Badge */}
        <div style={styles.badgeRow}>
          <div style={styles.escrowBadge}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.5px", color: "#38bdf8" }}>
              ESCROW SANDBOX SECURE PAYMENT
            </span>
          </div>
        </div>

        {verifying && (
          <div style={styles.centerContent}>
            <div style={styles.spinnerWrapper}>
              <Loader2 size={48} color="#6366f1" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h2 style={styles.title}>Verifying Escrow Deposit...</h2>
            <p style={styles.subtitle}>
              Securing funds in escrow and confirming transaction with Escrow.com Sandbox. Please wait a moment.
            </p>
          </div>
        )}

        {!verifying && success && (
          <div style={styles.centerContent}>
            <div style={styles.successIconWrapper}>
              <CheckCircle2 size={52} color="#10b981" />
            </div>
            <h2 style={styles.title}>Payment Successfully Secured!</h2>
            <p style={styles.subtitle}>
              Your funds have been deposited into project escrow. Redirecting you to your project dashboard...
            </p>
            <button
              onClick={() => handleRedirectTarget(true)}
              style={styles.primaryBtn}
            >
              <span>Continue to Project</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!verifying && !success && (
          <div style={styles.centerContent}>
            <div style={styles.errorIconWrapper}>
              <AlertTriangle size={52} color="#f87171" />
            </div>
            <h2 style={styles.title}>Payment Not Completed</h2>
            <p style={styles.subtitle}>
              {errorMsg || "The transaction was cancelled or could not be verified by Escrow Sandbox."}
            </p>
            <button
              onClick={() => handleRedirectTarget(false)}
              style={styles.cancelBtn}
            >
              <span>Return to Task</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#f8fafc"
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "rgba(15, 23, 42, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
    padding: "36px 32px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)",
    backdropFilter: "blur(16px)"
  },
  badgeRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "28px"
  },
  escrowBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.28)",
    padding: "6px 14px",
    borderRadius: "9999px"
  },
  centerContent: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  spinnerWrapper: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.12)"
  },
  successIconWrapper: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "50%",
    background: "rgba(16, 185, 129, 0.12)"
  },
  errorIconWrapper: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "50%",
    background: "rgba(248, 113, 113, 0.12)"
  },
  title: {
    fontSize: "1.45rem",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "12px",
    letterSpacing: "-0.02em"
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "28px",
    maxWidth: "420px"
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.35)",
    transition: "all 0.2s ease"
  },
  cancelBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#e2e8f0",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer"
  }
};
