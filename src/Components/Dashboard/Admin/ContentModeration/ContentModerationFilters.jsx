const ContentModerationFilters = ({
  activeFilter,
  filters,
  onFilterChange,
  onSeverityChange,
  severityFilter,
}) => (
  <section className="moderation-toolbar">
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

    <label className="moderation-severity-filter">
      <span>Severity:</span>
      <select value={severityFilter} onChange={(event) => onSeverityChange(event.target.value)}>
        <option>All Levels</option>
        <option>High Severity</option>
        <option>Medium Severity</option>
        <option>Low Severity</option>
      </select>
    </label>
  </section>
)

export default ContentModerationFilters
