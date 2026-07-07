const ContentModerationFilters = ({
  activeFilter,
  filters,
  onFilterChange,
  onSeverityChange,
  severityFilter,
  showReviewedOnly,
  onToggleReviewedOnly
}) => (
  <section className="moderation-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
    <div className="moderation-filter-tabs">
      {filters.map((filter) => (
        <button
          className={`moderation-filter-button ${activeFilter === filter ? 'active' : ''}`}
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#a8b3c5', fontWeight: '500' }}>
        <input 
          type="checkbox" 
          checked={showReviewedOnly} 
          onChange={(e) => onToggleReviewedOnly && onToggleReviewedOnly(e.target.checked)}
          style={{ 
            accentColor: '#6366f1',
            width: '16px',
            height: '16px',
            cursor: 'pointer'
          }} 
        />
        <span>Show Reviewed Items</span>
      </label>

      <label className="moderation-severity-filter">
        <span>Severity:</span>
        <select value={severityFilter} onChange={(event) => onSeverityChange(event.target.value)}>
          <option>All Levels</option>
          <option>High Severity</option>
          <option>Medium Severity</option>
          <option>Low Severity</option>
        </select>
      </label>
    </div>
  </section>
)

export default ContentModerationFilters
