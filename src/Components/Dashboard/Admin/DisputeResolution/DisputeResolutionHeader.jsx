import { Bell, Search } from 'lucide-react'
import adminAvatar from '../../../LandingPages/image/user_avatar.png'

const DisputeResolutionHeader = ({ searchQuery, onSearchChange }) => (
  <header className="dispute-header">
    <div>
      <h1>Dispute Resolution</h1>
      <p>Manage and resolve conflicts between clients and AI experts.</p>
    </div>

    <div className="dispute-header-tools">
      <label className="dispute-search">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search Case ID..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <button className="dispute-icon-button" type="button" aria-label="Notifications">
        <Bell size={17} />
      </button>
      <img src={adminAvatar} alt="Admin" className="dispute-avatar" />
    </div>
  </header>
)

export default DisputeResolutionHeader
