import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Search, Settings, User } from 'lucide-react'
import adminAvatar from '../../LandingPages/image/user_avatar.png'
import { getStoredUser } from '../../../Services/checkLogin'
import SettingPage from '../../../pages/SettingPage'
import useHandleClickOutside from '../HandleClickOutside'
import '../../Navbar/HeaderCom.css'

const AdminHeader = ({ notifications, onClearNotifications, searchQuery, onSearchChange, onLogout }) => {
  const { isProfileOpen, setIsProfileOpen, dropdownRef } = useHandleClickOutside()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const currentUser = getStoredUser()

  // Open settings as a modal and keep the current admin screen blurred behind it.
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

          <div className="admin-profile-container" ref={dropdownRef}>
            <button
              className={`admin-profile-widget admin-profile-button ${isProfileOpen ? 'active' : ''}`}
              type="button"
              onClick={() => setIsProfileOpen((value) => !value)}
            >
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
                <span className="admin-profile-role">Root Access</span>
              </div>
              <img src={adminAvatar} alt="Admin Profile" className="admin-profile-avatar" />
              <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`} />
            </button>

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
                  onClick={handleOpenSettings}
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
        role="Admin"
        onLogout={onLogout}
      />
    </>
  )
}

export default AdminHeader
