import {
  Briefcase,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react"

const clientMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "projects", label: "My Projects", icon: Briefcase },
  { id: "post-job", label: "Post a Job", icon: Plus },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>AITasker</h2>
        <p>AI Services Marketplace</p>
      </div>

      <nav className="sidebar-menu">
        {clientMenuItems.map(({ id, label, icon: Icon, active }) => (
          <a className={`menu-item ${active ? "active" : ""}`} href="#" key={id}>
            <Icon size={18} />
            {label}
          </a>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="post-task-btn">
          <Plus size={16} />
          Post a New Task
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
