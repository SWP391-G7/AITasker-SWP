import { useState } from "react";
import { Search } from "lucide-react";

const stackFilters = ["Python", "PyTorch", "OpenAI API", "TensorFlow", "NLP", "Computer Vision"];
const clientFilters = ["Technology", "Finance", "Healthcare", "Education", "Retail"];

const rateRanges = [
  { value: "under-50", label: "Under $50/hr" },
  { value: "50-100", label: "$50 - $100/hr" },
  { value: "100-200", label: "$100 - $200/hr" },
  { value: "over-200", label: "$200+/hr" },
];

const ClientExpertFilters = ({
  isExpertMode,
  filterOptions = [],
  selectedFilters,
  onToggleFilter,
  rating,
  onRatingChange,
  availability,
  onAvailabilityChange,
  rateRange,
  onRateRangeChange,
  skillSearch,
  onSkillSearchChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const baseFilters = isExpertMode ? clientFilters : stackFilters;
  const allOptions = ["All", ...baseFilters, "Other"];

  return (
    <aside className="expert-filters">
      <div className="filter-group">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{isExpertMode ? "CLIENT INDUSTRY" : "TECHNICAL STACK"}</h3>
          <button
            type="button"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setLocalSearch("");
                onSkillSearchChange("");
              }
            }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
          >
            <Search size={16} />
          </button>
        </div>

        {showSearch && (
          <input
            type="text"
            placeholder={isExpertMode ? "Search industry..." : "Search skill..."}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSkillSearchChange(localSearch);
              }
            }}
            style={{
              width: '100%', marginBottom: '10px', marginTop: '8px', padding: '8px 10px',
              background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box',
            }}
          />
        )}

        <div className="filter-tags">
          {allOptions.map((filter) => {
            const isAll = filter === "All";
            const isActive = isAll
              ? selectedFilters.length === 0
              : selectedFilters.includes(filter);
            return (
              <button
                type="button"
                key={filter}
                className={isActive ? "active" : ""}
                onClick={() => onToggleFilter(filter)}
              >
                {filter}
              </button>
            );
          })}
          {allOptions.length === 0 && (
            <span className="no-filter-options">No options available</span>
          )}
        </div>
      </div>

      <div className="filter-group">
          <h3>RATING</h3>
          <div className="filter-tags">
            <button
              type="button"
              className={!rating ? "active" : ""}
              onClick={() => onRatingChange("")}
            >
              All
            </button>
            <button
              type="button"
              className={rating === "4.5" ? "active" : ""}
              onClick={() => onRatingChange(rating === "4.5" ? "" : "4.5")}
            >
              4.5+
            </button>
            <button
              type="button"
              className={rating === "4.0" ? "active" : ""}
              onClick={() => onRatingChange(rating === "4.0" ? "" : "4.0")}
            >
              4.0+
            </button>
          </div>
        </div>

      {!isExpertMode && (
        <div className="filter-group">
          <h3>HOURLY RATE</h3>
          <div className="filter-tags">
            {rateRanges.map(({ value, label }) => (
              <button
                type="button"
                key={value}
                className={rateRange === value ? "active" : ""}
                onClick={() => onRateRangeChange(rateRange === value ? "" : value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <h3>{isExpertMode ? "STATUS" : "AVAILABILITY"}</h3>
        <div className="filter-tags">
          {[
            ["all", "Show All"],
            ["available", isExpertMode ? "Open to Hire" : "Available Now"],
            ["part-time", isExpertMode ? "Small Projects" : "Part-time (20h/w)"],
            ["full-time", isExpertMode ? "Long-term Work" : "Full-time (40h/w)"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={availability === value ? "active" : ""}
              onClick={() => onAvailabilityChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ClientExpertFilters;
