const ContentModerationFilters = ({
  activeFilter,
  filters,
  onFilterChange,
  onSeverityChange,
  severityFilter,
  reviewStatusFilter,
  onReviewStatusChange
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
      <label className="moderation-severity-filter">
        <span>Status:</span>
        <select
          value={reviewStatusFilter}
          onChange={(event) => onReviewStatusChange(event.target.value)}
        >
          <option value="all">All</option>
          <option value="reviewed">Show Reviewed Items</option>
          <option value="unreviewed">Show Unreviewed Items</option>
        </select>
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
