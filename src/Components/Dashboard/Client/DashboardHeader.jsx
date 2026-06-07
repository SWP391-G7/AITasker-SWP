import { Bell, Search } from "lucide-react"

function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div>
        <h1>Client Overview</h1>
        <p>Welcome back. Here's what's happening with your projects today.</p>
      </div>

      <div className="header-right">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search projects, tasks..." />
        </div>

        <button className="notification-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <div className="user-info">
            <strong>Andy</strong>
            <span>Client User</span>
          </div>

          <div className="avatar">A</div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
