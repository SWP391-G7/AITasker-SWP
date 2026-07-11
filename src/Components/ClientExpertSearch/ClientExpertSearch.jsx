import { useEffect, useMemo, useState } from "react";

import { search as searchApi } from "../../Services/searchService";
import { getFavorites, addFavorite, removeFavorite } from "../../Services/favoriteService";
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
    rating: Number(expert.avg_rating) || 0,
    reviews: 0,
    rate: hourlyRate,
    tags: skills.map((skill) => skill.toUpperCase()),
    description: expert.bio || "No bio provided.",
    projects: 0,
    success: 0,
    available: true,
    stack: skills,
    mode: "expert",
  };
};

const mapClientFromApi = (client) => {
  const industry = client.industry || "";
  const company = client.company_name || "";

  return {
    id: client.id,
    name: client.full_name || company || "Unnamed Client",
    title: company,
    avatar: client.avatar || defaultClientAvatar,
    rating: Number(client.avg_rating) || 0,
    reviews: 0,
    rate: 0,
    tags: industry ? [String(industry).toUpperCase()] : [],
    description: client.bio || "No bio provided.",
    projects: 0,
    success: 0,
    available: false,
    stack: industry ? [industry] : [],
    company,
    mode: "client",
  };
};

const ClientExpertSearch = () => {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('expertSearchViewMode') || getCurrentRole();
  });
  const isExpertMode = viewMode === "expert";

  useEffect(() => {
    localStorage.setItem('expertSearchViewMode', viewMode);
  }, [viewMode]);

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allFilterOptions, setAllFilterOptions] = useState([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [rating, setRating] = useState("");
  const [availability, setAvailability] = useState("all");
  const [rateRange, setRateRange] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(getFavorites(isExpertMode ? "client" : "expert")));

  const targetType = isExpertMode ? "client" : "expert";

  useEffect(() => {
    setFavoriteIds(new Set(getFavorites(targetType)));
  }, [targetType]);

  const toggleFavorite = (id) => {
    const isFav = favoriteIds.has(id);
    if (isFav) {
      removeFavorite(targetType, id);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      addFavorite(targetType, id);
      setFavoriteIds((prev) => new Set(prev).add(id));
    }
  };

  const toggleFilter = (filter) => {
    if (filter === "All") {
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

      const rateParams = {};
      if (!isExpertMode && rateRange) {
        const ranges = {
          "under-50": { min: 0, max: 50 },
          "50-100": { min: 50, max: 100 },
          "100-200": { min: 100, max: 200 },
          "over-200": { min: 200, max: undefined },
        };
        rateParams.hourlyRateMin = ranges[rateRange].min;
        if (ranges[rateRange].max) rateParams.hourlyRateMax = ranges[rateRange].max;
      }

      const activeSkillFilter = !isExpertMode && selectedFilters.length === 1 && selectedFilters[0] !== "Other" ? selectedFilters[0] : "";
      const activeIndustryFilter = isExpertMode && selectedFilters.length === 1 && selectedFilters[0] !== "Other" ? selectedFilters[0] : "";
      const result = await searchApi({
        target: isExpertMode ? "client" : "expert",
        query: searchQuery.trim(),
        skill: activeSkillFilter || skillSearch || "",
        industry: activeIndustryFilter || skillSearch || "",
        ratingMin: rating || "",
        ...rateParams,
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
  }, [isExpertMode, selectedFilters, skillSearch, rating, rateRange, searchQuery]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const result = await searchApi({
          target: isExpertMode ? "client" : "expert",
          query: searchQuery.trim(),
        });
        const mapped = (result.results || []).map(
          isExpertMode ? mapClientFromApi : mapExpertFromApi
        );
        const items = mapped.flatMap((p) => p.stack || []);
        const unique = [...new Set(items.map((s) => String(s).toUpperCase()))].sort();
        setAllFilterOptions(unique);
      } catch {
        setAllFilterOptions([]);
      }
    };
    fetchFilterOptions();
  }, [isExpertMode, searchQuery]);

  const filteredPeople = useMemo(() => {
    let result = people.filter((person) => {
      const keyword = searchQuery.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        person.name.toLowerCase().includes(keyword) ||
        person.title.toLowerCase().includes(keyword) ||
        person.description.toLowerCase().includes(keyword) ||
        person.tags.join(" ").toLowerCase().includes(keyword);

      const hardcodedFilters = isExpertMode
        ? ["Technology", "Finance", "Healthcare", "Education", "Retail"]
        : ["Python", "PyTorch", "OpenAI API", "TensorFlow", "NLP", "Computer Vision"];

      const matchFilter =
        selectedFilters.length === 0 ||
        selectedFilters.some((filter) => {
          if (filter === "Other") {
            return !person.stack.some((item) =>
              hardcodedFilters.some((hf) => item.toLowerCase() === hf.toLowerCase())
            );
          }
          return person.stack.some(
            (item) => item.toLowerCase() === filter.toLowerCase()
          );
        });

      const matchRating = !rating || person.rating >= Number(rating);

      const matchAvailability =
        availability === "all" ||
        (availability === "available" && (isExpertMode ? !!person.title : person.rate > 0)) ||
        (availability === "part-time" && (isExpertMode ? !!person.title : person.rate > 0 && person.rate <= 50)) ||
        (availability === "full-time" && (isExpertMode ? !!person.title : person.rate > 50));

      const matchRate = isExpertMode || !rateRange || (() => {
        const ranges = {
          "under-50": { min: 0, max: 50 },
          "50-100": { min: 50, max: 100 },
          "100-200": { min: 100, max: 200 },
          "over-200": { min: 200, max: Infinity },
        };
        const r = ranges[rateRange];
        return person.rate >= r.min && person.rate <= r.max;
      })();

      return matchSearch && matchFilter && matchRating && matchAvailability && matchRate;
    });

    if (sortBy === "rate-low") {
      result = [...result].sort((a, b) => a.rate - b.rate);
    } else if (sortBy === "rate-high") {
      result = [...result].sort((a, b) => b.rate - a.rate);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    result.sort((a, b) => {
      const aFav = favoriteIds.has(a.id) ? 1 : 0;
      const bFav = favoriteIds.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });

    return result;
  }, [availability, isExpertMode, people, rateRange, rating, searchQuery, selectedFilters, sortBy]);

  const filterOptions = useMemo(() => {
    return ["All", ...allFilterOptions];
  }, [allFilterOptions]);

  const resultLabel = isExpertMode ? "clients" : "experts";
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeople = filteredPeople.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="expert-search-page">
      <main key={viewMode} className="expert-search-page">
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
              filterOptions={filterOptions}
              selectedFilters={selectedFilters}
              onToggleFilter={toggleFilter}
              rating={rating}
              onRatingChange={setRating}
              availability={availability}
              onAvailabilityChange={setAvailability}
              rateRange={rateRange}
              onRateRangeChange={setRateRange}
              skillSearch={skillSearch}
              onSkillSearchChange={setSkillSearch}
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
                      isFavorited={favoriteIds.has(person.id)}
                      onToggleFavorite={toggleFavorite}
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
