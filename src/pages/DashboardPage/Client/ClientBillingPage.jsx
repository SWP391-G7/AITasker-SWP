import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Download,
  Plus,
  ShieldCheck,
  Wallet,
  ReceiptText,
  HelpCircle,
} from "lucide-react";
import ClientSidebar from "../../../Components/Dashboard/Client/ClientSidebar";
import ClientHeader from "../../../Components/Dashboard/Client/ClientHeader";
import Footer from "../../../Components/Footer/Footer";
import { useClientUser } from "../../../Components/Dashboard/Client/user";
import { logout } from "../../../Services/authService";
import { getUserProfile } from "../../../Services/profileService";
import "../Style/AdminDashboardPage.css";
import "./ClientMarketplace.css";

const transactions = [
  {
    id: "INV-2024-0142",
    service: "Enterprise LLM Fine-tuning",
    expert: "Dr. Julian V.",
    date: "Oct 21, 2024",
    amount: "$2,400.00",
    status: "Paid",
  },
  {
    id: "INV-2024-0138",
    service: "Neural Voice Synthesis",
    expert: "Sarah K.",
    date: "Oct 18, 2024",
    amount: "$1,250.00",
    status: "Escrow",
  },
  {
    id: "INV-2024-0127",
    service: "Predictive Churn Model v2",
    expert: "Marcus T.",
    date: "Oct 12, 2024",
    amount: "$3,800.00",
    status: "Paid",
  },
  {
    id: "INV-2024-0119",
    service: "Legacy Code Automation",
    expert: "Nexus Dev Labs",
    date: "Oct 02, 2024",
    amount: "$950.00",
    status: "Pending",
  },
];

function ClientBillingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(2);
  const user = useClientUser();
  const clientName = user?.fullName || user?.name || "Client User";
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      getUserProfile(userId)
        .then((data) => {
          if (data.clientProfile && data.clientProfile.budget !== undefined) {
            setBudget(parseFloat(data.clientProfile.budget));
          }
        })
        .catch((err) => {
          console.error("Failed to load client budget:", err);
        });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="market-client-layout">
      <ClientSidebar activeTab="billing" />

      <main className="billing-main">
        <ClientHeader
          title="Billing & Payments"
          subtitle="Manage payment methods, escrow funds, and transaction history."
          headerActions={
            <button className="billing-download-btn">
              <Download size={18} />
              Download Report
            </button>
          }
          notifications={notifications}
          onClearNotifications={() => setNotifications(0)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          user={user}
          onLogout={handleLogout}
        />

        <section className="billing-stats">
          <div className="billing-stat-card">
            <div>
              <span>ACTIVE ESCROW</span>
              <strong>$7,650.00</strong>
              <p>Funds secured for active milestones</p>
            </div>

            <div className="billing-icon blue">
              <ShieldCheck size={26} />
            </div>
          </div>

          <div className="billing-stat-card">
            <div>
              <span>WALLET BALANCE</span>
              <strong>{budget !== null ? `$${budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"}</strong>
              <p>Available balance for funding tasks</p>
            </div>

            <div className="billing-icon green">
              <Wallet size={26} />
            </div>
          </div>

          <div className="billing-stat-card">
            <div>
              <span>PENDING INVOICES</span>
              <strong>03</strong>
              <p>Invoices awaiting confirmation</p>
            </div>

            <div className="billing-icon orange">
              <ReceiptText size={26} />
            </div>
          </div>
        </section>

        <section className="billing-layout">
          <div className="billing-left">
            <section className="billing-panel payment-methods">
              <div className="billing-panel-header">
                <div>
                  <h2>Payment Methods</h2>
                  <p>Your saved cards and billing options.</p>
                </div>

                <button>
                  <Plus size={16} />
                  Add Method
                </button>
              </div>

              <div className="payment-card primary">
                <div className="payment-card-top">
                  <CreditCard size={28} />
                  <span>PRIMARY</span>
                </div>

                <h3>Visa ending in 4242</h3>
                <p>Expires 08/2028</p>

                <div className="payment-card-footer">
                  <strong>{clientName}</strong>
                  <button>Edit</button>
                </div>
              </div>

              <div className="payment-card">
                <div className="payment-card-top">
                  <CreditCard size={28} />
                  <span>BACKUP</span>
                </div>

                <h3>Mastercard ending in 9182</h3>
                <p>Expires 11/2027</p>

                <div className="payment-card-footer">
                  <strong>AITasker Business</strong>
                  <button>Edit</button>
                </div>
              </div>
            </section>

            <section className="billing-panel transaction-panel">
              <div className="billing-panel-header">
                <div>
                  <h2>Transaction History</h2>
                  <p>Recent payments and escrow releases.</p>
                </div>

                <button className="ghost-download">
                  <Download size={16} />
                  Export
                </button>
              </div>

              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.id}</strong>
                        <p>{item.expert}</p>
                      </td>

                      <td>{item.service}</td>
                      <td>{item.date}</td>
                      <td className="billing-amount">{item.amount}</td>

                      <td>
                        <span
                          className={`billing-status ${item.status.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <aside className="billing-right">
            <section className="billing-panel escrow-panel">
              <h2>Escrow Overview</h2>

              <div className="escrow-circle">
                <div>
                  <strong>72%</strong>
                  <span>Allocated</span>
                </div>
              </div>

              <div className="escrow-list">
                <div>
                  <span>Released</span>
                  <strong>$18,250</strong>
                </div>

                <div>
                  <span>In Escrow</span>
                  <strong>$7,650</strong>
                </div>

                <div>
                  <span>Pending Review</span>
                  <strong>$2,100</strong>
                </div>
              </div>
            </section>

            <section className="billing-support-card">
              <div className="support-icon">
                <HelpCircle size={28} />
              </div>

              <h2>Need billing support?</h2>

              <p>
                Our payment team can help with invoices, escrow questions, and
                refund requests.
              </p>

              <button>Contact Support</button>
            </section>
          </aside>
        </section>

        <Footer variant="dashboard" />
        {/*
        <footer className="market-footer billing-footer">
          <div>
            <strong>AITasker</strong>
            <p>© 2024 AITasker. All rights reserved.</p>
          </div>

          <div>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Center</span>
            <span>API Documentation</span>
          </div>
        </footer>
        */}
      </main>
    </div>
  );
}

export default ClientBillingPage;

