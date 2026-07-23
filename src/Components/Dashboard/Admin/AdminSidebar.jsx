/**
 * Frontend module: Components/Dashboard/Admin/AdminSidebar.jsx
 *
 * Vai trò: Component Admin Sidebar: khối giao diện có thể tái sử dụng trong một hoặc nhiều page.
 * Luồng chính: Nhận props, render trạng thái tương ứng và báo sự kiện lên component cha qua callback khi cần.
 * Lưu ý bảo trì: Không thay đổi props; state cục bộ chỉ nên phục vụ hành vi thuộc phạm vi component.
 */
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Home,
  LayoutDashboard,
  Scale,
  Shield,
  Users
} from 'lucide-react'

const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'moderation', label: 'Content Moderation', icon: Shield },
  { id: 'disputes', label: 'Dispute Resolution', icon: Scale },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

// React component “Admin Sidebar” nhận props, quản lý trạng thái cần thiết và render giao diện tương ứng.
const AdminSidebar = ({ activeTab, onTabChange }) => (
  <aside className="admin-sidebar">
    <div className="sidebar-header">
      <Link to="/" className="sidebar-brand mb-0">AITasker</Link>
      <span className="sidebar-subtitle">Admin Workspace</span>
    </div>

    <ul className="sidebar-menu">
      {adminMenuItems.map(({ id, label, icon: Icon }) => (
        <li key={id}>
          <div
            className={`sidebar-item-link ${activeTab === id ? 'active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </div>
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-4 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
      <Link to="/admin/moderation" className="btn btn-primary btn-sm fw-semibold admin-post-task-button">
        <span>Review Queue</span>
      </Link>
      <Link to="/" className="sidebar-item-link py-2 px-3">
        <Home size={18} />
        <span>Return to Homepage</span>
      </Link>
    </div>
  </aside>
)

export default AdminSidebar
