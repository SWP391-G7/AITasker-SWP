/**
 * Frontend module: pages/DashboardPage/Client/ClientBillingPage.jsx
 *
 * Vai trò: Page Client Billing Page: màn hình cấp route, điều phối dữ liệu và các component con cho một luồng nghiệp vụ hoàn chỉnh.
 * Luồng chính: Đọc route/location, gọi service trong effect/handler, quản lý loading/error/form rồi truyền props xuống UI con.
 * Lưu ý bảo trì: Giữ side effect trong handler/effect và không mutate trực tiếp state hoặc dữ liệu API.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  ExternalLink,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getUserProfile } from "../../../Services/profileService";
import { getMyTransactionsAPI } from "../../../Services/transactionService";
import { downloadClientBillingPdf } from "../../../Services/pdfExportService";
import "../Style/AdminDashboardPage.css";
import "../Style/ClientDashboardPage.css";
import "../../../Components/Dashboard/Expert/Earnings/EarningsPage.css";
import "./ClientBillingPage.css";

const EMPTY_STATS = {
  totalLifetime: 0,
  availableNow: 0,
  pendingClearance: 0,
  inEscrow: 0,
};

const STATUS_LABELS = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

const TYPE_LABELS = {
  escrow_deposit: "Escrow deposit",
  escrow_release: "Escrow release",
  refund: "Refund",
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(toNumber(value));

const formatDate = (value) => {
  if (!value) return "Not completed yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const shortId = (id) => (id ? `TX-${String(id).slice(0, 8).toUpperCase()}` : "TX-PENDING");

function ClientBillingPage() {
  const navigate = useNavigate();
  const user = useClientUser();
  const userId = user?.id || user?._id;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBillingData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [transactionResult, profileResult] = await Promise.all([
        getMyTransactionsAPI(),
        userId ? getUserProfile(userId) : Promise.resolve(null),
      ]);

      setTransactions(
        Array.isArray(transactionResult?.transactions)
          ? transactionResult.transactions
          : [],
      );
      setStats({
        ...EMPTY_STATS,
        ...(transactionResult?.stats || {}),
      });
      setBudget(toNumber(profileResult?.clientProfile?.budget));
    } catch (requestError) {
      console.error("Failed to load billing data:", requestError);
      setError(requestError.message || "Could not load billing information.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const requestTimer = window.setTimeout(() => {
      loadBillingData();
    }, 0);

    return () => window.clearTimeout(requestTimer);
  }, [loadBillingData]);

  const normalizedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        normalizedStatus: String(transaction.status || "pending").toLowerCase(),
        normalizedType: String(transaction.type || "escrow_deposit").toLowerCase(),
      })),
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedTransactions.filter((transaction) => {
      const matchesStatus =
        statusFilter === "all" || transaction.normalizedStatus === statusFilter;
      const matchesType =
        typeFilter === "all" || transaction.normalizedType === typeFilter;
      const searchableText = [
        transaction.id,
        transaction.project_title,
        transaction.expert_name,
        transaction.normalizedType,
        transaction.normalizedStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && matchesType && (!query || searchableText.includes(query));
    });
  }, [normalizedTransactions, searchQuery, statusFilter, typeFilter]);

  const completedCount = normalizedTransactions.filter(
    (transaction) => transaction.normalizedStatus === "completed",
  ).length;
  const pendingCount = normalizedTransactions.filter(
    (transaction) => transaction.normalizedStatus === "pending",
  ).length;
  const releasedAmount = normalizedTransactions
    .filter(
      (transaction) =>
        transaction.normalizedType === "escrow_release" &&
        transaction.normalizedStatus === "completed",
    )
    .reduce((total, transaction) => total + toNumber(transaction.amount), 0);
  const trackedFunds = toNumber(stats.totalLifetime) + toNumber(stats.inEscrow);
  const releasedPercent = trackedFunds
    ? Math.min(100, Math.round((toNumber(stats.totalLifetime) / trackedFunds) * 100))
    : 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleExportPDF = () => {
    downloadClientBillingPdf({
      user,
      transactions: filteredTransactions,
      stats: {
        ...stats,
        budget,
      },
    });
  };

  return (
    <div className="admin-dashboard-layout client-dashboard-layout">
      <ClientSidebar activeTab="billing" />

      <main className="admin-main-panel client-main-panel client-billing-page">
        <ClientHeader
          title="Payments & Escrow"
          subtitle="Track funded work, payment activity, and your available project budget."
          headerActions={
            <div className="header-actions">
              <button
                type="button"
                className="btn-export"
                onClick={handleExportPDF}
                disabled={!filteredTransactions.length}
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                type="button"
                className="btn-secondary-action"
                onClick={loadBillingData}
                aria-label="Refresh data"
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
                Refresh
              </button>
            </div>
          }
          notifications={0}
          onClearNotifications={() => {}}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <div className="client-billing-container">
          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" className="alert-retry-btn" onClick={loadBillingData}>
                Retry
              </button>
            </div>
          )}

          {/* Overview Cards styled like EarningsOverviewCards */}
          <div className="earnings-stats-grid client-billing-stats-grid">
            <div className="earnings-stat-card">
              <div className="stat-top-info">
                <div className="stat-icon-wrapper">
                  <WalletCards size={20} />
                </div>
                <span className="stat-trend-badge trend-neutral">CLIENT WALLET</span>
              </div>
              <h3>Available Budget</h3>
              <p className="stat-value">{loading ? "—" : formatMoney(budget)}</p>
            </div>

            <div className="earnings-stat-card">
              <div className="stat-top-info">
                <div className="stat-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <span className="stat-trend-badge trend-neutral">ACTIVE MILESTONES</span>
              </div>
              <h3>In Escrow</h3>
              <p className="stat-value">{loading ? "—" : formatMoney(stats.inEscrow)}</p>
            </div>

            <div className="earnings-stat-card">
              <div className="stat-top-info">
                <div className="stat-icon-wrapper">
                  <CircleDollarSign size={20} />
                </div>
                <span className="stat-trend-badge trend-up">{completedCount} COMPLETED</span>
              </div>
              <h3>Recorded Spend</h3>
              <p className="stat-value">{loading ? "—" : formatMoney(stats.totalLifetime)}</p>
            </div>

            <div className="earnings-stat-card">
              <div className="stat-top-info">
                <div className="stat-icon-wrapper">
                  <Clock3 size={20} />
                </div>
                <span className="stat-trend-badge trend-neutral">IN PROCESS</span>
              </div>
              <h3>Pending Activity</h3>
              <p className="stat-value">{loading ? "—" : pendingCount}</p>
            </div>
          </div>

          <div className="earnings-middle-grid client-billing-grid">
            {/* Main Column: Transaction History Table */}
            <div className="transactions-card client-billing-transactions-panel">
              <div className="table-header">
                <div>
                  <h4 className="card-title">Recent Transactions</h4>
                  <p className="card-subtitle">
                    Escrow deposits, releases, and refunds recorded for your account.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-export compact"
                  onClick={handleExportPDF}
                  disabled={!filteredTransactions.length}
                  aria-label="Export filtered transactions to PDF"
                >
                  <Download size={16} />
                  <span>PDF</span>
                </button>
              </div>

              <div className="client-billing-toolbar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search transaction, project..."
                  />
                </div>

                <div className="filter-select-group">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    aria-label="Filter by transaction type"
                  >
                    <option value="all">All types</option>
                    <option value="escrow_deposit">Escrow deposit</option>
                    <option value="escrow_release">Escrow release</option>
                    <option value="refund">Refund</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter by transaction status"
                  >
                    <option value="all">All statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="client-billing-table-wrap">
                {loading ? (
                  <div className="client-billing-state">
                    <Loader2 size={26} className="spin" />
                    <span>Syncing your latest payment activity…</span>
                  </div>
                ) : filteredTransactions.length ? (
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Project & Transaction</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div className="project-cell">
                              <div className="project-icon-box">
                                {transaction.normalizedType === "refund" ? (
                                  <ArrowDownLeft size={18} />
                                ) : transaction.normalizedType === "escrow_release" ? (
                                  <ShieldCheck size={18} />
                                ) : (
                                  <Landmark size={18} />
                                )}
                              </div>
                              <div className="project-info">
                                <span className="project-name-text">
                                  {transaction.project_title || "Proposal payment"}
                                </span>
                                <span className="project-id-text">
                                  {shortId(transaction.id)} • {transaction.expert_name || "AITasker expert"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="billing-type-tag">
                              {TYPE_LABELS[transaction.normalizedType] || transaction.normalizedType}
                            </span>
                          </td>
                          <td>{formatDate(transaction.complete_at)}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                transaction.normalizedStatus === "completed"
                                  ? "status-success"
                                  : transaction.normalizedStatus === "failed"
                                    ? "status-failed"
                                    : "status-active"
                              }`}
                            >
                              {transaction.normalizedType === "escrow_deposit" &&
                              transaction.normalizedStatus === "completed"
                                ? "SECURED"
                                : (
                                    STATUS_LABELS[transaction.normalizedStatus] ||
                                    transaction.normalizedStatus
                                  ).toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className="amount-text">{formatMoney(transaction.amount)}</span>
                          </td>
                          <td>
                            {transaction.project_id ? (
                              <button
                                type="button"
                                className="billing-row-action"
                                onClick={() => navigate(`/projects/${transaction.project_id}`)}
                                aria-label={`Open ${transaction.project_title || "project"}`}
                              >
                                <ExternalLink size={15} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="client-billing-state empty">
                    <CircleDollarSign size={30} />
                    <strong>
                      {normalizedTransactions.length
                        ? "No matching transactions"
                        : "No payment activity yet"}
                    </strong>
                    <span>
                      {normalizedTransactions.length
                        ? "Try clearing your search or changing the filters."
                        : "Transactions will appear here after you fund a proposal or milestone."}
                    </span>
                    {!normalizedTransactions.length && (
                      <button
                        type="button"
                        className="btn-export"
                        onClick={() => navigate("/client/projects")}
                      >
                        Go to projects
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Side Column: Breakdown & Sandbox Info */}
            <div className="client-billing-side-column">
              <div className="summary-card client-billing-summary-card">
                <h4 className="card-title">Payment Allocation</h4>
                <div className="summary-list client-billing-breakdown-list">
                  <div className="summary-item">
                    <label>Recorded Spend</label>
                    <span className="text-mint">{formatMoney(stats.totalLifetime)}</span>
                  </div>
                  <div className="summary-item">
                    <label>In Escrow</label>
                    <span>{formatMoney(stats.inEscrow)}</span>
                  </div>
                  <div className="summary-item">
                    <label>Released to Experts</label>
                    <span className="text-mint">{formatMoney(releasedAmount)}</span>
                  </div>
                  <div className="summary-divider" />
                  <div className="summary-item">
                    <label>Recorded Share</label>
                    <span>{releasedPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="summary-card client-billing-sandbox-card">
                <div className="sandbox-header">
                  <WalletCards size={20} />
                  <span className="sandbox-badge">SANDBOX MODE</span>
                </div>
                <h4 className="card-title">Escrow Sandbox</h4>
                <p className="sandbox-desc">
                  Powered by Escrow.com Sandbox API. Secured buyer & seller transactions with inspection protection.
                </p>
                <ul className="sandbox-features">
                  <li>
                    <CheckCircle2 size={14} /> Escrow.com Sandbox API integration
                  </li>
                  <li>
                    <CheckCircle2 size={14} /> Verified escrow transaction tracking
                  </li>
                </ul>
                <button
                  type="button"
                  className="view-all-link text-left"
                  onClick={() => navigate("/client/projects")}
                >
                  Manage funded work <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientBillingPage;
