import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { getStoredUser } from '../../../Services/checkLogin'
import useHandleClickOutside from '../HandleClickOutside'

const ExpertHeader = ({ title, subtitle, headerActions, notifications, onClearNotifications, searchQuery, onSearchChange, user, onLogout }) => {
  const { isProfileOpen, setIsProfileOpen, dropdownRef } = useHandleClickOutside()

  const currentUser = getStoredUser()

  const avatarLetter = () => {
    const currentUserName = currentUser?.fullName || currentUser?.name || "Expert"
    return currentUserName.trim().charAt(0).toUpperCase() || "E"
  }
  const userAvatar = avatarLetter()

  return (
    <header className="admin-header-section">
      <div className="admin-header-title">
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="admin-header-controls">
        {headerActions && <div className="admin-header-extra">{headerActions}</div>}

        <div className="admin-search-box">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <button className="icon-button position-relative" aria-label="Expert Notifications" onClick={onClearNotifications}>
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
              <span className="admin-profile-role">AI Expert</span>
            </div>
            <div className="admin-profile-avatar-wrapper">
              <div className="avatar">{userAvatar}</div>
            </div>
            <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`} />
          </div>

          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-header">
                <p className="user-email">{user?.email || 'sarah.kim@example.com'}</p>
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

export default ExpertHeader
