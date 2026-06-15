import { Bell, Search } from 'lucide-react'
import { getStoredUser } from '../../../Services/checkLogin'

const currentUser = getStoredUser()

const avatarLetter = () => {
  const currentUserName = currentUser?.fullName || currentUser?.name || "Client"
  return currentUserName.charAt(0).toUpperCase()
}
const userAvatar = avatarLetter()

const ClientHeader = ({ notifications, onClearNotifications, searchQuery, onSearchChange }) => (
  <header className="admin-header-section">
    <div className="admin-header-title">
      <h1>Client Overview</h1>
      <p>Welcome back. Here is what is happening with your projects today.</p>
    </div>

    <div className="admin-search-box">
      <Search size={16} className="admin-search-icon" />
      <input
        type="text"
        placeholder="Search projects, experts, or tasks..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>

    <div className="d-flex align-items-center gap-3">
      <button
        className="icon-button position-relative"
        aria-label="Client Notifications"
        onClick={onClearNotifications}
      >
        <Bell size={20} />
        {notifications > 0 && <span className="icon-badge bg-sky"></span>}
      </button>

      <div className="admin-profile-widget">
        <div className="admin-profile-info">
          <span className="admin-profile-name">{currentUser?.fullName || currentUser?.name || "Client User"}</span>
          <span className="admin-profile-role">Client User</span>
        </div>
        <div className="avatar">{userAvatar}</div>
      </div>
    </div>
  </header>
)

export default ClientHeader
