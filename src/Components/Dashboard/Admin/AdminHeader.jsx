import { Bell, Search } from 'lucide-react'
import adminAvatar from '../../LandingPages/image/user_avatar.png'

const AdminHeader = ({ notifications, onClearNotifications, searchQuery, onSearchChange }) => (
  <header className="admin-header-section">
    <div className="admin-header-title">
      <h1>Admin Command Center</h1>
      <p>System oversight and marketplace operations</p>
    </div>

    <div className="admin-search-box">
      <Search size={16} className="admin-search-icon" />
      <input
        type="text"
        placeholder="Search users, tasks, or disputes..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>

    <div className="d-flex align-items-center gap-3">
      <button className="icon-button position-relative" aria-label="System Notifications" onClick={onClearNotifications}>
        <Bell size={20} />
        {notifications > 0 && <span className="icon-badge bg-sky"></span>}
      </button>

      <div className="admin-profile-widget">
        <div className="admin-profile-info">
          <span className="admin-profile-name">Admin</span>
          <span className="admin-profile-role">Root Access</span>
        </div>
        <img src={adminAvatar} alt="Admin Profile" className="admin-profile-avatar" />
      </div>
    </div>
  </header>
)

export default AdminHeader
