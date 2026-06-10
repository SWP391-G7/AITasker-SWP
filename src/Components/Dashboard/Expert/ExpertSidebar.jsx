import { Link } from 'react-router-dom'
import {
  Briefcase,
  DollarSign,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  Settings
} from 'lucide-react'

const expertMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'My Projects', icon: Briefcase },
  { id: 'work', label: 'Find Work', icon: Search },
  { id: 'earnings', label: 'Earnings', icon: DollarSign },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const ExpertSidebar = ({ activeTab, onTabChange, onLogout }) => (
  <aside className="admin-sidebar">
    <div className="sidebar-header">
      <Link to="/" className="sidebar-brand mb-0">AITasker</Link>
      <span className="sidebar-subtitle">AI Services Marketplace</span>
    </div>

    <ul className="sidebar-menu">
      {expertMenuItems.map(({ id, label, icon: Icon }) => (
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

    <div className="mt-auto pt-4 border-top border-secondary border-opacity-25 d-flex flex-column gap-3">
      <Link to="/expert/post-task" className="sidebar-post-task-btn">
        <PlusCircle size={18} />
        <span>Post a New Task</span>
      </Link>
      <div className="sidebar-item-link py-2 px-3 text-danger" style={{ cursor: 'pointer' }} onClick={onLogout}>
        <LogOut size={18} />
        <span>Log out</span>
      </div>
    </div>
  </aside>
)

export default ExpertSidebar
