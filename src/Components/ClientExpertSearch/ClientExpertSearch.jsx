import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { search as searchApi } from "../../Services/searchService";
import ClientExpertHero from "./ClientExpertHero";
import ClientExpertSearchBox from "./ClientExpertSearchBox";
import ClientExpertFilters from "./ClientExpertFilters";
import ClientExpertCard from "./ClientExpertCard";
import ClientExpertPagination from "./ClientExpertPagination";

const defaultExpertAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";

const defaultClientAvatar =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&h=200&fit=crop";

const getCurrentRole = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.role || "client";
  } catch {
    return "client";
  }
};

const splitCsv = (value) =>
  value
    ? String(value).split(",").map((item) => item.trim()).filter(Boolean)
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

const ClientExpertSearch = () => {
  const [viewMode, setViewMode] = useState(getCurrentRole());
  const isExpertMode = viewMode === "expert";

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
        query: searchQuery.trim(),
        skill:
          !isExpertMode && selectedFilters.length > 0
            ? selectedFilters.join(",")
            : "",
        industry:
          isExpertMode && selectedFilters.length > 0
            ? selectedFilters.join(",")
            : "",
        ratingMin: !isExpertMode && rating ? rating : "",
        hourlyRateMax: !isExpertMode && availability === "part-time" ? 180 : "",
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
  }, [isExpertMode, selectedFilters, rating, availability, searchQuery]);

  const filteredPeople = useMemo(() => {
    let result = people.filter((person) => {
      const keyword = searchQuery.toLowerCase().trim();

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
    } else if (sortBy === "rate-high") {
      result = [...result].sort((a, b) => b.rate - a.rate);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [availability, isExpertMode, people, rating, searchQuery, selectedFilters, sortBy]);

  const resultLabel = isExpertMode ? "clients" : "experts";
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeople = filteredPeople.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="expert-search-page">
      <main className="expert-search-page">
        <section className="expert-main">
          <ClientExpertHero isExpertMode={isExpertMode} />

          <div className="expert-search-row">
            <ClientExpertSearchBox
              isExpertMode={isExpertMode}
              search={search}
              onSearchChange={setSearch}
              onSearch={setSearchQuery}
            />

            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${!isExpertMode ? "active" : ""}`}
                onClick={() => setViewMode("client")}
              >
                Experts
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${isExpertMode ? "active" : ""}`}
                onClick={() => setViewMode("expert")}
              >
                Clients
              </button>
            </div>
          </div>

          <section className="expert-content">
            <ClientExpertFilters
              isExpertMode={isExpertMode}
              selectedFilters={selectedFilters}
              onToggleFilter={toggleFilter}
              rating={rating}
              onRatingChange={setRating}
              availability={availability}
              onAvailabilityChange={setAvailability}
            />

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
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
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
                <div className="no-expert-result">Loading {resultLabel}...</div>
              ) : error ? (
                <div className="no-expert-result">{error}</div>
              ) : filteredPeople.length === 0 ? (
                <div className="no-expert-result">
                  No {resultLabel} found. Try changing your filters.
                </div>
              ) : (
                <div className="expert-grid">
                  {currentPeople.map((person) => (
                    <ClientExpertCard
                      key={person.id}
                      person={person}
                      isExpertMode={isExpertMode}
                    />
                  ))}
                </div>
              )}

              <ClientExpertPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </section>
          </section>
        </section>
      </main>
    </div>
  );
};

export default ClientExpertSearch;
