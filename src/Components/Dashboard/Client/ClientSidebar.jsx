/**
 * Frontend module: Components/Dashboard/Client/ClientSidebar.jsx
 *
 * Vai trò: Component Client Sidebar: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CreditCard,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
} from "lucide-react";

const clientMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "My Projects", icon: BriefcaseBusiness },
  // { id: "post-job", label: "Post a Job", icon: PlusCircle },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  // Settings is temporarily disabled here because it now opens from the avatar popup.
];

// Defensive filter: keep Settings hidden even if the menu array is changed later.
const visibleClientMenuItems = clientMenuItems.filter((item) => item.id !== "settings");

// React component “Client Sidebar” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const ClientSidebar = ({ activeTab = "dashboard", onTabChange }) => {
  const navigate = useNavigate();

  // Handler “handle menu click” điều phối sự kiện, cập nhật state và gọi service/callback liên quan.
  const handleMenuClick = (id) => {
    if (onTabChange) {
      onTabChange(id);
    }

    if (id === "dashboard") navigate("/client/dashboard");
    if (id === "projects") navigate("/client/projects");
    if (id === "post-job") navigate("/client/post-job");
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
        {visibleClientMenuItems.map(({ id, label, icon: Icon }) => (
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
