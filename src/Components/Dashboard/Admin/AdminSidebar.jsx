import { Link } from 'react-router-dom'
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Scale,
  Shield,
  Users
} from 'lucide-react'

//List of sidebar menu items for admin dashboard - in a real app this might be generated dynamically based on user permissions or fetched from an API
const adminMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'moderation', label: 'Content Moderation', icon: Shield },
  { id: 'disputes', label: 'Dispute Resolution', icon: Scale },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  // Settings moved to the avatar popup; keep this line for quick rollback.
  // { id: 'settings', label: 'Settings', icon: Settings }
]

const AdminSidebar = ({ activeTab, onTabChange, onLogout }) => (
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
      <Link to="/" className="sidebar-item-link py-2 px-3">
        <Home size={18} />
        <span>Return to Site</span>
      </Link>
      <div className="sidebar-item-link py-2 px-3 text-danger" onClick={onLogout}>
        <LogOut size={18} />
        <span>Log out</span>
      </div>
      {/* ADMIN SIDEBAR: Quick action nằm dưới Log out giống nút Post a New Task ở client sidebar. */}
      <Link to="/admin-moderation" className="admin-post-task-button">
        <PlusCircle size={15} />
        <span>Review Queue</span>
      </Link>
    </div>
  </aside>
)

export default AdminSidebar
