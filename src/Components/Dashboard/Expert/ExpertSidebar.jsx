import { Link } from 'react-router-dom'
import {
  Briefcase,
  DollarSign,
  Home,
  LayoutDashboard,
  MessageSquare,
  Search
} from 'lucide-react'

const expertMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'My Projects', icon: Briefcase },
  { id: 'work', label: 'Find Work', icon: Search },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  // Settings is temporarily disabled here because it now opens from the avatar popup.
]

// Defensive filter: keep Settings hidden even if the menu array is changed later.
const visibleExpertMenuItems = expertMenuItems.filter((item) => item.id !== 'settings')

const ExpertSidebar = ({ activeTab, onTabChange }) => (
  <aside className="admin-sidebar">
    <div className="sidebar-header">
      <Link to="/" className="sidebar-brand mb-0">AITasker</Link>
      <span className="sidebar-subtitle">Expert Workspace</span>
    </div>

    <ul className="sidebar-menu">
      {visibleExpertMenuItems.map(({ id, label, icon: Icon }) => (
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
      <Link to="/expert/post-task" className="btn btn-primary btn-sm fw-semibold">
        Post a New Task
      </Link>
      <Link to="/" className="sidebar-item-link py-2 px-3">
        <Home size={18} />
        <span>Return to Homepage</span>
      </Link>
    </div>
  </aside>
)

export default ExpertSidebar
