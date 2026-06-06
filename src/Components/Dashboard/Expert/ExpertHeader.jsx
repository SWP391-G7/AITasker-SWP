import { Bell, Search } from 'lucide-react'
import expertAvatar from '../../LandingPages/image/expert_sarah.png'

const ExpertHeader = ({ notifications, onClearNotifications, searchQuery, onSearchChange, user }) => (
  <header className="admin-header-section">
    <div className="admin-header-title">
      <h1>Expert Overview</h1>
      <p>Your performance is up <span className="trend-up">+12.4%</span> this month.</p>
    </div>

    <div className="admin-search-box">
      <Search size={16} className="admin-search-icon" />
      <input
        type="text"
        placeholder="Search projects, tasks..."
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>

    <div className="d-flex align-items-center gap-3">
      <button className="icon-button position-relative" aria-label="Expert Notifications" onClick={onClearNotifications}>
        <Bell size={20} />
        {notifications > 0 && <span className="icon-badge bg-sky"></span>}
      </button>

      <div className="admin-profile-widget">
        <div className="admin-profile-info">
          <span className="admin-profile-name">{user?.name || user?.username || 'Sarah Kim'}</span>
          <span className="admin-profile-role">AI Expert</span>
        </div>
        <img src={user?.avatar || expertAvatar} alt="Expert Profile" className="admin-profile-avatar" />
      </div>
    </div>
  </header>
)

export default ExpertHeader
