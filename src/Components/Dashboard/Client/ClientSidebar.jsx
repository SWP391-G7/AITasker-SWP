import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CreditCard,
  Home,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";

const clientMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "My Projects", icon: BriefcaseBusiness },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  // Settings moved to the avatar popup; keep this line for quick rollback.
  // { id: "settings", label: "Settings", icon: Settings },
];

const ClientSidebar = ({ activeTab = "dashboard", onTabChange }) => {
  const navigate = useNavigate();

  const handleMenuClick = (id) => {
    if (onTabChange) {
      onTabChange(id);
    }

    if (id === "dashboard") navigate("/client/dashboard");
    if (id === "projects") navigate("/client/projects");
    if (id === "messages") navigate("/client/messages");
    if (id === "billing") navigate("/client/billing");
    // Settings now opens from the avatar popup instead of sidebar navigation.
    // if (id === "settings") navigate("/client/settings");
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand mb-0">
          AITasker
        </Link>
        <span className="sidebar-subtitle">Client Workspace</span>
      </div>

      <ul className="sidebar-menu">
        {clientMenuItems.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <div
              className={`sidebar-item-link ${activeTab === id ? "active" : ""}`}
              onClick={() => handleMenuClick(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
        <button
          className="btn btn-primary btn-sm fw-semibold"
          onClick={() => navigate("/client/post-job")}
        >
          Post a New Task
        </button>

        <Link to="/" className="sidebar-item-link py-2 px-3">
          <Home size={18} />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </aside>
  );
};

export default ClientSidebar;
