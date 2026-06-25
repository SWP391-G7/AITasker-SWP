const stackFilters = [
  "Python", "PyTorch", "OpenAI API", "TensorFlow", "NLP", "Computer Vision", "SHOW ALL",
];

const clientFilters = [
  "Technology", "Finance", "Healthcare", "Education", "Retail", "SHOW ALL",
];

const ClientExpertFilters = ({
  isExpertMode,
  selectedFilters,
  onToggleFilter,
  rating,
  onRatingChange,
  availability,
  onAvailabilityChange,
}) => {
  const currentFilters = isExpertMode ? clientFilters : stackFilters;

  return (
    <aside className="expert-filters">
      <div className="filter-group">
        <h3>{isExpertMode ? "CLIENT INDUSTRY" : "TECHNICAL STACK"}</h3>
        <div className="filter-tags">
          {currentFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={selectedFilters.includes(filter) ? "active" : ""}
              onClick={() => onToggleFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {!isExpertMode && (
        <div className="filter-group">
          <h3>EXPERT RATING</h3>
          <label className="rating-row">
            <input
              type="checkbox"
              checked={rating === "4.5"}
              onChange={() => onRatingChange(rating === "4.5" ? "" : "4.5")}
            />
            <span>5 stars</span>
            <strong>4.5 & up</strong>
          </label>
          <label className="rating-row">
            <input
              type="checkbox"
              checked={rating === "4.0"}
              onChange={() => onRatingChange(rating === "4.0" ? "" : "4.0")}
            />
            <span>4 stars</span>
            <strong>4.0 & up</strong>
          </label>
        </div>
      )}

      <div className="filter-group">
        <h3>{isExpertMode ? "CLIENT ACTIVITY" : "HOURLY RATE"}</h3>
        <div className="rate-line"></div>
        <div className="rate-labels">
          {isExpertMode ? (
            <>
              <span>New</span>
              <strong>Verified clients</strong>
              <span>Active</span>
            </>
          ) : (
            <>
              <span>$20</span>
              <strong>Up to $150/hr</strong>
              <span>$500+</span>
            </>
          )}
        </div>
      </div>

      <div className="filter-group">
        <h3>{isExpertMode ? "STATUS" : "AVAILABILITY"}</h3>
        {[
          ["available", isExpertMode ? "Open to Hire" : "Available Now"],
          ["part-time", isExpertMode ? "Small Projects" : "Part-time (20h/w)"],
          ["full-time", isExpertMode ? "Long-term Work" : "Full-time (40h/w)"],
          ["all", "Show All"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`availability-btn ${availability === value ? "active" : ""}`}
            onClick={() => onAvailabilityChange(value)}
          >
            {label}
            <span></span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default ClientExpertFilters;
