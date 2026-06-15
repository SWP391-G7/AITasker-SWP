import { Bell, Mail, Search } from 'lucide-react'

const ContentModerationHeader = ({ searchQuery, onSearchChange }) => (
  <header className="moderation-topbar">
    <h1 className="moderation-title">Content Moderation</h1>

    <div className="moderation-topbar-tools">
      <label className="moderation-search">
        <Search size={15} />
        <input
          type="text"
          placeholder="Search flagged IDs..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <button className="moderation-icon-button" aria-label="Notifications">
        <Bell size={17} />
      </button>
      <button className="moderation-icon-button" aria-label="Messages">
        <Mail size={17} />
      </button>
    </div>
  </header>
)

export default ContentModerationHeader
