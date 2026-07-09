import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react'
import { getStoredUser } from '../../../Services/checkLogin'
import SettingPage from '../../../pages/SettingPage'
import useHandleClickOutside from '../HandleClickOutside'
import NotificationDropdown from '../../Navbar/NotificationDropdown'
import '../../Navbar/HeaderCom.css'

const ClientHeader = ({ title, subtitle, headerActions, notifications, onClearNotifications, searchQuery, onSearchChange, user, onLogout }) => {
  const { isProfileOpen, setIsProfileOpen, dropdownRef } = useHandleClickOutside()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const currentUser = user || getStoredUser()
  const currentUserName = currentUser?.fullName || currentUser?.name || 'Client User'
  const userAvatar = currentUserName.charAt(0).toUpperCase()

  // Open settings as a modal so the current dashboard stays in the background.
  const handleOpenSettings = () => {
    setIsProfileOpen(false)
    setIsSettingsOpen(true)
  }

  const handleProfile = () => {
    setIsProfileOpen(false)
    if (currentUser && (currentUser.id || currentUser._id)) {
      navigate(`/profile/${currentUser.id || currentUser._id}`)
    }
  }

  return (
    <>
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
              placeholder="Search projects, experts..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <NotificationDropdown />

          <div className="admin-profile-container" ref={dropdownRef}>
            <div
              className={`admin-profile-widget ${isProfileOpen ? 'active' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="admin-profile-info">
                <span className="admin-profile-name">{currentUserName}</span>
                <span className="admin-profile-role">Client</span>
              </div>
              <div className="admin-profile-avatar-wrapper">
                <div className="avatar">{userAvatar}</div>
              </div>
              <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`} />
            </div>

            {isProfileOpen && (
              <div className="avatar-dropdown">
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={handleProfile}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  className="dropdown-item"
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    handleOpenSettings()
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <hr className="dropdown-divider my-1" />
                <button
                  className="dropdown-item logout-item"
                  type="button"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingPage
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
        role="Client"
        onLogout={onLogout}
      />
    </>
  )
}

export default ClientHeader
