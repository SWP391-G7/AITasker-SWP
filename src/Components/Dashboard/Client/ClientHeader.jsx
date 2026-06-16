import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react'
import { getStoredUser } from '../../../Services/checkLogin'
import useHandleClickOutside from '../HandleClickOutside'

const currentUser = getStoredUser()

const avatarLetter = () => {
  const currentUserName = currentUser?.fullName || currentUser?.name || "Client"
  return currentUserName.charAt(0).toUpperCase()
}
const userAvatar = avatarLetter()

const ClientHeader = ({ notifications, onClearNotifications, searchQuery, onSearchChange, onLogout }) => {
  const { isProfileOpen, setIsProfileOpen, dropdownRef } = useHandleClickOutside()

  return (
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

        <div className="admin-profile-container" ref={dropdownRef}>
          <div
            className={`admin-profile-widget ${isProfileOpen ? 'active' : ''}`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="admin-profile-info">
              <span className="admin-profile-name">{currentUser?.fullName || currentUser?.name || "Client User"}</span>
              <span className="admin-profile-role">Client </span>
            </div>
            <div className="avatar">{userAvatar}</div>
            <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`} />
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <p className="user-email">{currentUser?.email || 'client@example.com'}</p>
              </div>
              <ul className="dropdown-list">
                <li>
                  <button className="dropdown-item">
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                </li>
                <li>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={onLogout}>
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default ClientHeader
