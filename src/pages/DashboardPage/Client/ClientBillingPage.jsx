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
import "../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const shortId = (id) => (id ? `TX-${String(id).slice(0, 8).toUpperCase()}` : "TX-PENDING");

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

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

  const handleExport = () => {
    if (!filteredTransactions.length) return;

    const rows = [
      ["Transaction", "Project", "Expert", "Type", "Date", "Amount", "Status"],
      ...filteredTransactions.map((transaction) => [
        shortId(transaction.id),
        transaction.project_title || "Unassigned project",
        transaction.expert_name || "Expert",
        TYPE_LABELS[transaction.normalizedType] || transaction.normalizedType,
        formatDate(transaction.complete_at),
        toNumber(transaction.amount).toFixed(2),
        STATUS_LABELS[transaction.normalizedStatus] || transaction.normalizedStatus,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aitasker-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="billing" />

      <main className="billing-main client-billing-page">
        <ClientHeader
          title="Payments & Escrow"
          subtitle="Track funded work, payment activity, and your available project budget."
          headerActions={
            <button
              type="button"
              className="billing-download-btn"
              onClick={handleExport}
              disabled={!filteredTransactions.length}
            >
              <Download size={17} />
              Export CSV
            </button>
          }
          notifications={0}
          onClearNotifications={() => {}}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="client-billing-hero">
          <div>
            <div className="client-billing-eyebrow">
              <ShieldCheck size={16} />
              PAYMENT CONTROL CENTER
            </div>
            <h2>Every project payment, clearly accounted for.</h2>
            <p>
              Your wallet and transaction data are loaded directly from AITasker APIs.
              Card checkout is currently running in sandbox mode.
            </p>
          </div>
          <div className="client-billing-hero-actions">
            <button type="button" className="billing-secondary-action" onClick={loadBillingData}>
              <RefreshCw size={17} className={loading ? "spin" : ""} />
              Refresh
            </button>
            <button type="button" className="billing-primary-action" onClick={() => navigate("/client/projects")}>
              View projects
              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        {error && (
          <div className="client-billing-alert" role="alert">
            <AlertCircle size={20} />
            <div>
              <strong>Billing data could not be loaded</strong>
              <span>{error}</span>
            </div>
            <button type="button" onClick={loadBillingData}>Try again</button>
          </div>
        )}

        <section className="client-billing-stats" aria-label="Billing summary">
          <article className="client-billing-stat wallet">
            <div className="client-billing-stat-icon"><WalletCards size={22} /></div>
            <div>
              <span>AVAILABLE BUDGET</span>
              <strong>{loading ? "—" : formatMoney(budget)}</strong>
              <p>Current client wallet balance</p>
            </div>
          </article>
          <article className="client-billing-stat escrow">
            <div className="client-billing-stat-icon"><ShieldCheck size={22} /></div>
            <div>
              <span>IN ESCROW</span>
              <strong>{loading ? "—" : formatMoney(stats.inEscrow)}</strong>
              <p>Funds attached to active milestones</p>
            </div>
          </article>
          <article className="client-billing-stat spent">
            <div className="client-billing-stat-icon"><CircleDollarSign size={22} /></div>
            <div>
              <span>RECORDED SPEND</span>
              <strong>{loading ? "—" : formatMoney(stats.totalLifetime)}</strong>
              <p>{completedCount} completed transaction{completedCount === 1 ? "" : "s"}</p>
            </div>
          </article>
          <article className="client-billing-stat pending">
            <div className="client-billing-stat-icon"><Clock3 size={22} /></div>
            <div>
              <span>PENDING ACTIVITY</span>
              <strong>{loading ? "—" : pendingCount}</strong>
              <p>Transactions awaiting completion</p>
            </div>
          </article>
        </section>

        <section className="client-billing-grid">
          <div className="client-billing-main-column">
            <section className="client-billing-panel transaction-panel-live">
              <div className="client-billing-panel-heading">
                <div>
                  <span className="client-billing-section-kicker">LIVE API DATA</span>
                  <h2>Transaction history</h2>
                  <p>Escrow deposits, releases, and refunds recorded for your account.</p>
                </div>
                <button
                  type="button"
                  className="billing-icon-button"
                  onClick={handleExport}
                  disabled={!filteredTransactions.length}
                  aria-label="Export filtered transactions"
                >
                  <Download size={18} />
                </button>
              </div>

              <div className="client-billing-toolbar">
                <label className="client-billing-search">
                  <Search size={17} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search transaction, project, or expert"
                  />
                </label>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by transaction type">
                  <option value="all">All types</option>
                  <option value="escrow_deposit">Escrow deposit</option>
                  <option value="escrow_release">Escrow release</option>
                  <option value="refund">Refund</option>
                </select>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by transaction status">
                  <option value="all">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="client-billing-table-wrap">
                {loading ? (
                  <div className="client-billing-state">
                    <Loader2 size={30} className="spin" />
                    <strong>Loading transactions</strong>
                    <span>Syncing your latest payment activity…</span>
                  </div>
                ) : filteredTransactions.length ? (
                  <table className="client-billing-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Project</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <strong>{shortId(transaction.id)}</strong>
                            <span>{transaction.expert_name || "AITasker expert"}</span>
                          </td>
                          <td>
                            <strong>{transaction.project_title || "Proposal payment"}</strong>
                            <span>{transaction.project_id ? "Project linked" : "Awaiting project creation"}</span>
                          </td>
                          <td>
                            <span className={`billing-type-icon ${transaction.normalizedType}`}>
                              {transaction.normalizedType === "refund" ? <ArrowDownLeft size={15} /> : <Landmark size={15} />}
                            </span>
                            {TYPE_LABELS[transaction.normalizedType] || transaction.normalizedType}
                          </td>
                          <td>{formatDate(transaction.complete_at)}</td>
                          <td className="client-billing-amount">{formatMoney(transaction.amount)}</td>
                          <td>
                            <span className={`client-billing-status ${transaction.normalizedStatus}`}>
                              {transaction.normalizedStatus === "completed" && <CheckCircle2 size={13} />}
                              {transaction.normalizedStatus === "pending" && <Clock3 size={13} />}
                              {transaction.normalizedStatus === "failed" && <AlertCircle size={13} />}
                              {STATUS_LABELS[transaction.normalizedStatus] || transaction.normalizedStatus}
                            </span>
                          </td>
                          <td>
                            {transaction.project_id ? (
                              <button
                                type="button"
                                className="billing-row-action"
                                onClick={() => navigate(`/projects/${transaction.project_id}`)}
                                aria-label={`Open ${transaction.project_title || "project"}`}
                              >
                                <ExternalLink size={16} />
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="client-billing-state empty">
                    <CircleDollarSign size={32} />
                    <strong>{normalizedTransactions.length ? "No matching transactions" : "No payment activity yet"}</strong>
                    <span>
                      {normalizedTransactions.length
                        ? "Try clearing your search or changing the filters."
                        : "Transactions will appear here after you fund a proposal or milestone."}
                    </span>
                    {!normalizedTransactions.length && (
                      <button type="button" onClick={() => navigate("/client/projects")}>Go to projects</button>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="client-billing-side-column">
            <section className="client-billing-panel client-billing-funds-card">
              <div className="client-billing-panel-heading compact">
                <div>
                  <span className="client-billing-section-kicker">FUNDS OVERVIEW</span>
                  <h2>Payment allocation</h2>
                </div>
              </div>
              <div
                className="client-billing-progress-ring"
                style={{ "--billing-progress": `${releasedPercent * 3.6}deg` }}
              >
                <div>
                  <strong>{releasedPercent}%</strong>
                  <span>Recorded</span>
                </div>
              </div>
              <div className="client-billing-breakdown">
                <div><span><i className="released" />Recorded spend</span><strong>{formatMoney(stats.totalLifetime)}</strong></div>
                <div><span><i className="escrow" />In escrow</span><strong>{formatMoney(stats.inEscrow)}</strong></div>
                <div><span><i className="release" />Released to experts</span><strong>{formatMoney(releasedAmount)}</strong></div>
              </div>
            </section>

            <section className="client-billing-panel client-billing-sandbox-card">
              <div className="client-billing-sandbox-icon"><WalletCards size={24} /></div>
              <span className="client-billing-sandbox-badge">SANDBOX MODE</span>
              <h2>Mock payment gateway</h2>
              <p>
                AITasker currently uses a simulated card checkout for proposal funding.
                No real card is saved to your account.
              </p>
              <ul>
                <li><CheckCircle2 size={15} />Signed webhook confirmation</li>
                <li><CheckCircle2 size={15} />Escrow transaction tracking</li>
                <li><Clock3 size={15} />Real payment provider pending</li>
              </ul>
              <button type="button" onClick={() => navigate("/client/projects")}>Manage funded work <ChevronRight size={16} /></button>
            </section>
          </aside>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ClientBillingPage;
