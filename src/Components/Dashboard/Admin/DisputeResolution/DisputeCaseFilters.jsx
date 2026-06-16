const DisputeCaseFilters = ({ activeFilter, filters, onFilterChange }) => (
  <div className="dispute-section-heading">
    <h2>Recent Cases</h2>
    <div className="dispute-filter-tabs">
      {filters.map((filter) => (
        <button
          className={`dispute-filter-button ${activeFilter === filter ? 'active' : ''}`}
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  </div>
)

export default DisputeCaseFilters
