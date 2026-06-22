import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import Footer from "../../../Components/Footer/Footer";
import { search as searchApi } from "../../../Services/searchService";
import "./ExpertSearchPage.css";

const defaultExpertAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";

const defaultClientAvatar =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop";



const stackFilters = [
  "Python",
  "PyTorch",
  "OpenAI API",
  "TensorFlow",
  "NLP",
  "Computer Vision",
  "SHOW ALL",
];

const clientFilters = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "SHOW ALL",
];

const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.role || "client";
  } catch {
    return "client";
  }
};

const splitCsv = (value) =>
  value
    ? String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const mapExpertFromApi = (expert) => {
  const skills = splitCsv(expert.skills);
  const hourlyRate =
    Number(String(expert.hourly_rate || "0").replace(/[^0-9.]/g, "")) || 0;

  return {
    id: expert.id,
    name: expert.full_name || "Unnamed Expert",
    title: expert.professional_title || "AI Expert",
    avatar: expert.avatar || defaultExpertAvatar,
    rating: Number(expert.avg_rating) || 4.8,
    reviews: Number(expert.review_count) || 0,
    rate: hourlyRate,
    tags: skills.length
      ? skills.map((skill) => skill.toUpperCase())
      : ["AI EXPERT"],
    description: expert.bio || "No bio provided.",
    projects: Number(expert.completed_projects) || 0,
    success: Number(expert.job_success) || 100,
    available: true,
    stack: skills,
    mode: "expert",
  };
};

const mapClientFromApi = (client) => {
  const industry = client.industry || client.company_industry || "Client";
  const company = client.company_name || "Client Company";

  return {
    id: client.id,
    name: client.full_name || company || "Unnamed Client",
    title: company,
    avatar: client.avatar || defaultClientAvatar,
    rating: Number(client.avg_rating) || 4.8,
    reviews: Number(client.review_count) || 0,
    rate: 0,
    tags: [String(industry).toUpperCase()],
    description:
      client.bio ||
      client.company_description ||
      "This client is looking for AI experts to help with project delivery.",
    projects: Number(client.posted_jobs_count || client.jobs_count) || 0,
    success: 100,
    available: true,
    stack: [industry],
    company,
    mode: "client",
  };
};

function ExpertSearchPage() {
  const navigate = useNavigate();
  const isExpertMode = getCurrentRole() === "expert";
  const currentFilters = isExpertMode ? clientFilters : stackFilters;

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [rating, setRating] = useState("");
  const [availability, setAvailability] = useState("available");
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);

  const toggleFilter = (filter) => {
    if (filter === "SHOW ALL") {
      setSelectedFilters([]);
      return;
    }

    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter]
    );
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await searchApi({
        target: isExpertMode ? "client" : "expert",
        query: search.trim(),
        skill:
          !isExpertMode && selectedFilters.length === 1
            ? selectedFilters[0]
            : "",
        industry:
          isExpertMode && selectedFilters.length === 1
            ? selectedFilters[0]
            : "",
      });

      const mapped = (result.results || []).map(
        isExpertMode ? mapClientFromApi : mapExpertFromApi
      );

      setPeople(mapped);
      setPage(1);
    } catch (err) {
      setError(
        err.message ||
          `Failed to load ${isExpertMode ? "clients" : "experts"}.`
      );
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPeople = useMemo(() => {
    let result = people.filter((person) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        person.name.toLowerCase().includes(keyword) ||
        person.title.toLowerCase().includes(keyword) ||
        person.description.toLowerCase().includes(keyword) ||
        person.tags.join(" ").toLowerCase().includes(keyword);

      const matchFilter =
        selectedFilters.length === 0 ||
        selectedFilters.some((filter) =>
          person.stack.some(
            (item) => item.toLowerCase() === filter.toLowerCase()
          )
        );

      const matchRating = isExpertMode || !rating || person.rating >= Number(rating);

      const matchAvailability =
        isExpertMode ||
        availability === "all" ||
        (availability === "available" && person.available) ||
        (availability === "part-time" && person.rate <= 180) ||
        (availability === "full-time" && person.projects >= 50);

      return matchSearch && matchFilter && matchRating && matchAvailability;
    });

    if (sortBy === "rate-low") {
      result = [...result].sort((a, b) => a.rate - b.rate);
    }

    if (sortBy === "rate-high") {
      result = [...result].sort((a, b) => b.rate - a.rate);
    }

    if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    availability,
    isExpertMode,
    people,
    rating,
    search,
    selectedFilters,
    sortBy,
  ]);

  const resultLabel = isExpertMode ? "clients" : "experts";

  return (
    <div className="expert-search-page">
      <main className="expert-search-page">
        <section className="expert-main">
          <section className="expert-hero">
            <div>
              <h2>
                {isExpertMode
                  ? "Discover Clients Hiring AI Experts"
                  : "Hire World-Class AI Experts"}
              </h2>
              <p>
                {isExpertMode
                  ? "Browse clients and companies looking for AI specialists, project partners, and technical delivery support."
                  : "Connect with machine learning engineers, data scientists, and AI architects to accelerate your innovation."}
              </p>
            </div>

          </section>

          <div className="expert-search-box">
            <Search size={22} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchPeople();
                }
              }}
              placeholder={
                isExpertMode ? "Search clients..." : "Search specialists..."
              }
            />
            <span>Enter</span>
          </div>

          <section className="expert-content">
            <aside className="expert-filters">
              <div className="filter-group">
                <h3>{isExpertMode ? "CLIENT INDUSTRY" : "TECHNICAL STACK"}</h3>

                <div className="filter-tags">
                  {currentFilters.map((filter) => (
                    <button
                      type="button"
                      key={filter}
                      className={
                        selectedFilters.includes(filter) ? "active" : ""
                      }
                      onClick={() => toggleFilter(filter)}
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
                      onChange={() =>
                        setRating(rating === "4.5" ? "" : "4.5")
                      }
                    />
                    <span>5 stars</span>
                    <strong>4.5 & up</strong>
                  </label>

                  <label className="rating-row">
                    <input
                      type="checkbox"
                      checked={rating === "4.0"}
                      onChange={() =>
                        setRating(rating === "4.0" ? "" : "4.0")
                      }
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
                    className={`availability-btn ${
                      availability === value ? "active" : ""
                    }`}
                    onClick={() => setAvailability(value)}
                  >
                    {label}
                    <span></span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="expert-results">
              <div className="results-header">
                <strong>
                  {filteredPeople.length.toLocaleString()} {resultLabel} found
                  matching your criteria
                </strong>

                <div className="sort-box">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    {!isExpertMode && (
                      <>
                        <option value="rate-low">Rate: Low to High</option>
                        <option value="rate-high">Rate: High to Low</option>
                      </>
                    )}
                  </select>
                  <ChevronDown size={18} />
                </div>
              </div>

              {loading ? (
                <div className="no-expert-result">
                  Loading {resultLabel}...
                </div>
              ) : error ? (
                <div className="no-expert-result">{error}</div>
              ) : filteredPeople.length === 0 ? (
                <div className="no-expert-result">
                  No {resultLabel} found. Try changing your filters.
                </div>
              ) : (
                <div className="expert-grid">
                  {filteredPeople.map((person) => (
                    <article className="expert-card" key={person.id}>
                      <div className="expert-card-top">
                        <div className="expert-avatar-wrap">
                          <img src={person.avatar} alt={person.name} />
                          {person.available && <span className="online-dot"></span>}
                        </div>

                        <div className="expert-rating">
                          <div>
                            <Star size={18} fill="currentColor" />
                            <strong>{person.rating}</strong>
                            <span>({person.reviews})</span>
                          </div>
                          <strong>
                            {isExpertMode ? "Client" : `$${person.rate}/hr`}
                          </strong>
                        </div>
                      </div>

                      <h2>{person.name}</h2>
                      <h4>{person.title}</h4>

                      <div className="expert-tags">
                        {person.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <p>{person.description}</p>

                      <div className="expert-stats">
                        <span>
                          <CheckCircle2 size={18} />
                          {person.projects}{" "}
                          {isExpertMode ? "Projects Posted" : "Projects"}
                        </span>

                        <span>
                          <Clock3 size={18} />
                          {isExpertMode
                            ? "Verified Client"
                            : `${person.success}% Job Success`}
                        </span>
                      </div>

                      <div className="expert-actions">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              isExpertMode
                                ? "/expert/work"
                                : `/client/experts/${person.id}`
                            )
                          }
                        >
                          {isExpertMode ? "View Client" : "View Profile"}
                        </button>

                        <button className="favorite-btn" type="button">
                          <Heart size={24} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="pagination">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  <ChevronLeft size={22} />
                </button>

                {[1, 2, 3].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={page === item ? "active" : ""}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ))}

                <span>...</span>

                <button type="button" onClick={() => setPage(24)}>
                  24
                </button>

                <button type="button" onClick={() => setPage(page + 1)}>
                  <ChevronRight size={22} />
                </button>
              </div>
            </section>
          </section>
        </section>

        <Footer variant="dashboard" />
      </main>
    </div>
  );
}

export default ExpertSearchPage;