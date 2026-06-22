import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { search } from "../Services/searchService";
import { Search, SlidersHorizontal, User, Briefcase, Settings, Star } from "lucide-react";
import "./SearchResultsPage.css";

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search parameters state (bound to controls)
  const target = searchParams.get("target") || "expert";
  const query = searchParams.get("query") || "";

  const [filters, setFilters] = useState({
    budgetMin: searchParams.get("budgetMin") || "",
    budgetMax: searchParams.get("budgetMax") || "",
    requiredSkill: searchParams.get("requiredSkill") || "",
    duration: searchParams.get("duration") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    pricingType: searchParams.get("pricingType") || "",
    skill: searchParams.get("skill") || "",
    experience: searchParams.get("experience") || "",
    professionalTitle: searchParams.get("professionalTitle") || "",
    hourlyRateMin: searchParams.get("hourlyRateMin") || "",
    hourlyRateMax: searchParams.get("hourlyRateMax") || "",
    industry: searchParams.get("industry") || "",
    companyName: searchParams.get("companyName") || "",
  });

  const [localQuery, setLocalQuery] = useState(query);

  // Sync state with URL params when they change
  useEffect(() => {
    setLocalQuery(query);
    setFilters({
      budgetMin: searchParams.get("budgetMin") || "",
      budgetMax: searchParams.get("budgetMax") || "",
      requiredSkill: searchParams.get("requiredSkill") || "",
      duration: searchParams.get("duration") || "",
      priceMin: searchParams.get("priceMin") || "",
      priceMax: searchParams.get("priceMax") || "",
      pricingType: searchParams.get("pricingType") || "",
      skill: searchParams.get("skill") || "",
      experience: searchParams.get("experience") || "",
      professionalTitle: searchParams.get("professionalTitle") || "",
      hourlyRateMin: searchParams.get("hourlyRateMin") || "",
      hourlyRateMax: searchParams.get("hourlyRateMax") || "",
      industry: searchParams.get("industry") || "",
      companyName: searchParams.get("companyName") || "",
    });

    const executeSearch = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Assemble parameters to send to search service
        const searchPayload = { target, query };
        
        if (target === "jobs") {
          searchPayload.budgetMin = searchParams.get("budgetMin");
          searchPayload.budgetMax = searchParams.get("budgetMax");
          searchPayload.requiredSkill = searchParams.get("requiredSkill");
          searchPayload.duration = searchParams.get("duration");
        } else if (target === "services") {
          searchPayload.priceMin = searchParams.get("priceMin");
          searchPayload.priceMax = searchParams.get("priceMax");
          searchPayload.pricingType = searchParams.get("pricingType");
        } else if (target === "expert") {
          searchPayload.skill = searchParams.get("skill");
          searchPayload.experience = searchParams.get("experience");
          searchPayload.professionalTitle = searchParams.get("professionalTitle");
          searchPayload.hourlyRateMin = searchParams.get("hourlyRateMin");
          searchPayload.hourlyRateMax = searchParams.get("hourlyRateMax");
        } else if (target === "client") {
          searchPayload.industry = searchParams.get("industry");
          searchPayload.companyName = searchParams.get("companyName");
        }

        const data = await search(searchPayload);
        setResults(data.results);
      } catch (err) {
        console.error("Search failed:", err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [searchParams, target, query]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    
    const nextParams = new URLSearchParams();
    nextParams.append("target", target);
    if (localQuery.trim()) {
      nextParams.append("query", localQuery.trim());
    }

    if (target === "jobs") {
      if (filters.budgetMin) nextParams.append("budgetMin", filters.budgetMin);
      if (filters.budgetMax) nextParams.append("budgetMax", filters.budgetMax);
      if (filters.requiredSkill) nextParams.append("requiredSkill", filters.requiredSkill);
      if (filters.duration) nextParams.append("duration", filters.duration);
    } else if (target === "services") {
      if (filters.priceMin) nextParams.append("priceMin", filters.priceMin);
      if (filters.priceMax) nextParams.append("priceMax", filters.priceMax);
      if (filters.pricingType) nextParams.append("pricingType", filters.pricingType);
    } else if (target === "expert") {
      if (filters.skill) nextParams.append("skill", filters.skill);
      if (filters.experience) nextParams.append("experience", filters.experience);
      if (filters.professionalTitle) nextParams.append("professionalTitle", filters.professionalTitle);
      if (filters.hourlyRateMin) nextParams.append("hourlyRateMin", filters.hourlyRateMin);
      if (filters.hourlyRateMax) nextParams.append("hourlyRateMax", filters.hourlyRateMax);
    } else if (target === "client") {
      if (filters.industry) nextParams.append("industry", filters.industry);
      if (filters.companyName) nextParams.append("companyName", filters.companyName);
    }

    setSearchParams(nextParams);
  };

  const handleTargetChange = (newTarget) => {
    // Clear all target-specific filters on tab change
    setFilters({
      budgetMin: "",
      budgetMax: "",
      requiredSkill: "",
      duration: "",
      priceMin: "",
      priceMax: "",
      pricingType: "",
      skill: "",
      experience: "",
      professionalTitle: "",
      hourlyRateMin: "",
      hourlyRateMax: "",
      industry: "",
      companyName: "",
    });
    
    setSearchParams({ target: newTarget, query: localQuery });
  };

  const formatCurrency = (val) => {
    return val !== null && val !== undefined ? `$${Number(val).toLocaleString()}` : "";
  };

  return (
    <div className="search-results-page-wrapper">

      <div className="search-results-hero">
        <div className="container text-center py-4">
          <form className="results-search-bar mx-auto" onSubmit={handleApplyFilters}>
            <Search size={18} className="results-search-icon" />
            <input
              type="text"
              className="results-search-input shadow-none bg-transparent"
              placeholder={`Search in ${target === "expert" ? "Experts" : target === "client" ? "Clients" : target === "services" ? "Services" : "Jobs"}...`}
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <button type="submit" className="results-search-btn">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="search-results-layout-container container px-sm-5 py-4">
        <div className="search-results-grid">
          
          {/* Left Panel - Filters */}
          <aside className="search-filters-sidebar">
            <div className="filters-sidebar-card">
              <div className="sidebar-section-header mb-4">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <h3 className="mb-0">Filter Target</h3>
                </div>
              </div>

              {/* Target Tab Pills */}
              <div className="target-select-pills mb-4">
                <button
                  className={`target-pill ${target === "expert" ? "active" : ""}`}
                  onClick={() => handleTargetChange("expert")}
                >
                  Experts
                </button>
                <button
                  className={`target-pill ${target === "client" ? "active" : ""}`}
                  onClick={() => handleTargetChange("client")}
                >
                  Clients
                </button>
                <button
                  className={`target-pill ${target === "services" ? "active" : ""}`}
                  onClick={() => handleTargetChange("services")}
                >
                  Services
                </button>
                <button
                  className={`target-pill ${target === "jobs" ? "active" : ""}`}
                  onClick={() => handleTargetChange("jobs")}
                >
                  Jobs
                </button>
              </div>

              <form onSubmit={handleApplyFilters} className="criteria-filter-form">
                <h4 className="criteria-header mb-3">Criteria Indicator</h4>

                {target === "jobs" && (
                  <>
                    <div className="filter-group mb-3">
                      <label>Budget Level ($)</label>
                      <div className="range-inputs mt-2">
                        <input
                          type="number"
                          name="budgetMin"
                          placeholder="Min budget"
                          value={filters.budgetMin}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                        <span className="range-divider">to</span>
                        <input
                          type="number"
                          name="budgetMax"
                          placeholder="Max budget"
                          value={filters.budgetMax}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="filter-group mb-3">
                      <label>Required Skill</label>
                      <input
                        type="text"
                        name="requiredSkill"
                        placeholder="e.g. Python, NLP"
                        value={filters.requiredSkill}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <div className="filter-group mb-4">
                      <label>Max Duration (Days)</label>
                      <input
                        type="number"
                        name="duration"
                        placeholder="e.g. 30"
                        value={filters.duration}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>
                  </>
                )}

                {target === "services" && (
                  <>
                    <div className="filter-group mb-3">
                      <label>Price Level ($)</label>
                      <div className="range-inputs mt-2">
                        <input
                          type="number"
                          name="priceMin"
                          placeholder="Min price"
                          value={filters.priceMin}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                        <span className="range-divider">to</span>
                        <input
                          type="number"
                          name="priceMax"
                          placeholder="Max price"
                          value={filters.priceMax}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="filter-group mb-4">
                      <label>Pricing Type</label>
                      <select
                        name="pricingType"
                        value={filters.pricingType}
                        onChange={handleFilterChange}
                        className="form-select mt-2"
                      >
                        <option value="">All Pricing Types</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Contract</option>
                      </select>
                    </div>
                  </>
                )}

                {target === "expert" && (
                  <>
                    <div className="filter-group mb-3">
                      <label>Required Skill</label>
                      <input
                        type="text"
                        name="skill"
                        placeholder="e.g. LLM, PyTorch"
                        value={filters.skill}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <div className="filter-group mb-3">
                      <label>Experience (Years/Level)</label>
                      <input
                        type="text"
                        name="experience"
                        placeholder="e.g. 5 years, senior"
                        value={filters.experience}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <div className="filter-group mb-3">
                      <label>Professional Title</label>
                      <input
                        type="text"
                        name="professionalTitle"
                        placeholder="e.g. AI Consultant"
                        value={filters.professionalTitle}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <div className="filter-group mb-4">
                      <label>Hourly Rate ($/hr)</label>
                      <div className="range-inputs mt-2">
                        <input
                          type="number"
                          name="hourlyRateMin"
                          placeholder="Min Rate"
                          value={filters.hourlyRateMin}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                        <span className="range-divider">to</span>
                        <input
                          type="number"
                          name="hourlyRateMax"
                          placeholder="Max Rate"
                          value={filters.hourlyRateMax}
                          onChange={handleFilterChange}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </>
                )}

                {target === "client" && (
                  <>
                    <div className="filter-group mb-3">
                      <label>Industry</label>
                      <input
                        type="text"
                        name="industry"
                        placeholder="e.g. Finance, Health"
                        value={filters.industry}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>

                    <div className="filter-group mb-4">
                      <label>Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="e.g. Google, AITasker"
                        value={filters.companyName}
                        onChange={handleFilterChange}
                        className="form-control mt-2"
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="apply-filters-btn glow-hover w-100">
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Right Panel - Results */}
          <main className="search-results-main">
            <div className="results-header mb-4">
              <h2>Search Results ({results.length})</h2>
            </div>

            {isLoading ? (
              <div className="results-loading-state">
                <div className="spinner"></div>
                <p>Querying the database for AI targets...</p>
              </div>
            ) : error ? (
              <div className="results-error-state">
                <span>⚠️</span>
                <p>{error}</p>
                <button className="btn btn-outline-primary mt-3" onClick={handleApplyFilters}>
                  Retry Search
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="results-empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No results matches your criteria</h3>
                <p>Try clearing some criteria indicators or refining your search term to see profiles, jobs, or services.</p>
              </div>
            ) : (
              <div className="results-list-grid">
                
                {/* 1. RENDER EXPERT RESULTS */}
                {target === "expert" &&
                  results.map((exp) => (
                    <div key={exp.id} className="result-card expert-card-item">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-placeholder">
                            {exp.full_name?.charAt(0).toUpperCase() || "E"}
                          </div>
                          <div className="text-start">
                            <h3 className="card-item-title mb-1">{exp.full_name}</h3>
                            <p className="card-item-subtitle text-primary mb-0">
                              {exp.professional_title || "AI Specialist"}
                            </p>
                          </div>
                        </div>
                        <div className="rating-tag">
                          <Star size={12} className="fill-warning text-warning" />
                          <span>{exp.avg_rating ? exp.avg_rating.toFixed(1) : "0.0"}</span>
                        </div>
                      </div>

                      <p className="card-bio text-start mb-3">
                        {exp.bio || "Vetted machine learning engineer ready to support business AI operations."}
                      </p>

                      {exp.skills && (
                        <div className="skills-row d-flex flex-wrap gap-2 mb-3">
                          {exp.skills.split(",").map((s, idx) => (
                            <span key={idx} className="skill-badge">{s.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div className="card-footer-metrics border-top pt-3 d-flex align-items-center justify-content-between">
                        <span className="metric-item">
                          💼 <strong>{exp.experience || "Entry Level"}</strong>
                        </span>
                        <span className="rate-item text-success fw-bold">
                          {exp.hourly_rate ? `${exp.hourly_rate}` : "Flexible $/hr"}
                        </span>
                      </div>
                    </div>
                  ))}

                {/* 2. RENDER CLIENT RESULTS */}
                {target === "client" &&
                  results.map((cli) => (
                    <div key={cli.id} className="result-card client-card-item">
                      <div className="d-flex align-items-center gap-3 mb-3 text-start">
                        <div className="avatar-placeholder client-avatar">
                          {cli.company_name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <h3 className="card-item-title mb-1">
                            {cli.company_name || "Enterprise Company"}
                          </h3>
                          <p className="card-item-subtitle text-muted mb-0">
                            Representative: {cli.full_name}
                          </p>
                        </div>
                      </div>

                      <p className="card-bio text-start mb-3">
                        {cli.bio || "Client company looking to acquire advanced AI solutions and experts."}
                      </p>

                      <div className="card-footer-metrics border-top pt-3 text-start">
                        <span className="industry-label">
                          🏢 Industry: <strong>{cli.industry || "General / Other"}</strong>
                        </span>
                      </div>
                    </div>
                  ))}

                {/* 3. RENDER SERVICE RESULTS */}
                {target === "services" &&
                  results.map((svc) => (
                    <div key={svc.id} className="result-card service-card-item">
                      <div className="d-flex align-items-start justify-content-between mb-3 text-start">
                        <div>
                          <h3 className="card-item-title mb-1">{svc.title}</h3>
                          <p className="card-item-subtitle text-muted mb-0">
                            Offered by: {svc.expert_name || "Vetted Expert"}
                          </p>
                        </div>
                        <span className={`status-pill ${svc.pricing_type}`}>
                          {svc.pricing_type}
                        </span>
                      </div>

                      <p className="card-bio text-start mb-3">
                        {svc.description}
                      </p>

                      {svc.tags && (
                        <div className="skills-row d-flex flex-wrap gap-2 mb-3">
                          {svc.tags.split(",").map((t, idx) => (
                            <span key={idx} className="skill-badge">{t.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div className="card-footer-metrics border-top pt-3 d-flex align-items-center justify-content-between">
                        <span className="metric-item">
                          ⏱️ Delivery: <strong>{svc.delivery_days} Days</strong>
                        </span>
                        <span className="rate-item text-success fw-bold">
                          {formatCurrency(svc.price)}
                        </span>
                      </div>
                    </div>
                  ))}

                {/* 4. RENDER JOB RESULTS */}
                {target === "jobs" &&
                  results.map((job) => (
                    <div key={job.id} className="result-card job-card-item">
                      <div className="d-flex align-items-start justify-content-between mb-3 text-start">
                        <div>
                          <h3 className="card-item-title mb-1">{job.title}</h3>
                          <p className="card-item-subtitle text-muted mb-0">
                            Posted by: {job.company_name || job.client_name || "Client"}
                          </p>
                        </div>
                        <span className={`status-pill ${job.status}`}>
                          {job.status}
                        </span>
                      </div>

                      <p className="card-bio text-start mb-3">
                        {job.description}
                      </p>

                      {job.required_skill && (
                        <div className="skills-row d-flex flex-wrap gap-2 mb-3">
                          <span className="skill-badge">{job.required_skill}</span>
                        </div>
                      )}

                      <div className="card-footer-metrics border-top pt-3 d-flex align-items-center justify-content-between">
                        <span className="metric-item">
                          ⏱️ Duration: <strong>{job.duration_days ? `${job.duration_days} Days` : "Flexible"}</strong>
                        </span>
                        <span className="rate-item text-success fw-bold">
                          {formatBudget(job.budget_min, job.budget_max)}
                        </span>
                      </div>
                    </div>
                  ))}

              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );

  function formatBudget(min, max) {
    if (min !== null && max !== null) {
      return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
    }
    if (min !== null) {
      return `Min $${Number(min).toLocaleString()}`;
    }
    if (max !== null) {
      return `Max $${Number(max).toLocaleString()}`;
    }
    return "Flexible Budget";
  }
}

export default SearchResultsPage;
