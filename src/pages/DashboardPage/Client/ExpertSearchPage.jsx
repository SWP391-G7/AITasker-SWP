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

const fallbackExperts = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Senior ML Engineer & PhD in Neural Networks",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    rating: 4.9,
    reviews: 128,
    rate: 180,
    tags: ["LLM TUNING", "PYTORCH", "RAG SYSTEMS"],
    description:
      "Expert in building and deploying large-scale retrieval augmented generation systems and fine-tuned LLM products.",
    projects: 84,
    success: 100,
    available: true,
    stack: ["Python", "PyTorch", "OpenAI API", "NLP"],
  },
  {
    id: 2,
    name: "Marcus Holloway",
    title: "Lead AI Architect & Infrastructure Specialist",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    rating: 5.0,
    reviews: 92,
    rate: 225,
    tags: ["TENSORFLOW", "AWS SAGEMAKER", "KUBERNETES"],
    description:
      "Specializing in MLOps and scaling AI workloads across hybrid-cloud environments. Proven track record.",
    projects: 52,
    success: 98,
    available: true,
    stack: ["TensorFlow", "AI Integration", "Automation"],
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    title: "NLP Specialist & Conversation Designer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    rating: 4.8,
    reviews: 214,
    rate: 155,
    tags: ["OPENAI API", "LANGCHAIN", "HUGGINGFACE"],
    description:
      "Designing next-gen conversational interfaces and building complex agentic workflows using modern LLM tools.",
    projects: 142,
    success: 99,
    available: true,
    stack: ["OpenAI API", "NLP", "Python"],
  },
  {
    id: 4,
    name: "Alex Ivanov",
    title: "Computer Vision Engineer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    rating: 4.7,
    reviews: 56,
    rate: 140,
    tags: ["OPENCV", "YOLOV8", "DOCKER"],
    description:
      "Expert in real-time object detection and video analytics. Specializing in edge computing and CV pipelines.",
    projects: 38,
    success: 95,
    available: false,
    stack: ["Computer Vision", "Python", "Automation"],
  },
];

const mapExpertFromApi = (expert) => {
  const skills = expert.skills
    ? String(expert.skills)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  const hourlyRate =
    Number(String(expert.hourly_rate || "0").replace(/[^0-9.]/g, "")) || 0;

  return {
    id: expert.id,
    name: expert.full_name || "Unnamed Expert",
    title: expert.professional_title || "AI Expert",
    avatar:
      expert.avatar ||
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
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
  };
};

const stackFilters = [
  "Python",
  "PyTorch",
  "OpenAI API",
  "TensorFlow",
  "NLP",
  "Computer Vision",
  "SHOW ALL",
];

function ExpertSearchPage() {
  const navigate = useNavigate();

  const [experts, setExperts] = useState(fallbackExperts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [rating, setRating] = useState("");
  const [availability, setAvailability] = useState("available");
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);

  const toggleStack = (stack) => {
    if (stack === "SHOW ALL") {
      setSelectedStacks([]);
      return;
    }

    setSelectedStacks((prev) =>
      prev.includes(stack)
        ? prev.filter((item) => item !== stack)
        : [...prev, stack]
    );
  };

  const fetchExperts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await searchApi({
        target: "expert",
        query: search.trim(),
        skill: selectedStacks.length === 1 ? selectedStacks[0] : "",
      });

      setExperts((result.results || []).map(mapExpertFromApi));
      setPage(1);
    } catch (err) {
      setError(err.message || "Failed to load experts.");
      setExperts(fallbackExperts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExperts = useMemo(() => {
    let result = experts.filter((expert) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        !keyword ||
        expert.name.toLowerCase().includes(keyword) ||
        expert.title.toLowerCase().includes(keyword) ||
        expert.description.toLowerCase().includes(keyword) ||
        expert.tags.join(" ").toLowerCase().includes(keyword);

      const matchStack =
        selectedStacks.length === 0 ||
        selectedStacks.some((stack) => expert.stack.includes(stack));

      const matchRating = !rating || expert.rating >= Number(rating);

      const matchAvailability =
        availability === "all" ||
        (availability === "available" && expert.available) ||
        (availability === "part-time" && expert.rate <= 180) ||
        (availability === "full-time" && expert.projects >= 50);

      return matchSearch && matchStack && matchRating && matchAvailability;
    });

    if (sortBy === "rate-low") result = [...result].sort((a, b) => a.rate - b.rate);
    if (sortBy === "rate-high") result = [...result].sort((a, b) => b.rate - a.rate);
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [experts, search, selectedStacks, rating, availability, sortBy]);

  return (
    <div className="expert-search-page">
      

      <main className="expert-search-page">
        <section className="expert-main">
          <section className="expert-hero">
            <div>
              <h2>Hire World-Class AI Experts</h2>
              <p>
                Connect with machine learning engineers, data scientists, and AI
                architects to accelerate your innovation.
              </p>
            </div>

            <button className="advanced-filter-btn" type="button" onClick={fetchExperts}>
              <SlidersHorizontal size={22} />
              Apply Filters
            </button>
          </section>

          <div className="expert-search-box">
            <Search size={22} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchExperts();
                }
              }}
              placeholder="Search specialists..."
            />
            <span>⌘K</span>
          </div>

          <section className="expert-content">
            <aside className="expert-filters">
              <div className="filter-group">
                <h3>TECHNICAL STACK</h3>

                <div className="filter-tags">
                  {stackFilters.map((stack) => (
                    <button
                      type="button"
                      key={stack}
                      className={selectedStacks.includes(stack) ? "active" : ""}
                      onClick={() => toggleStack(stack)}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>EXPERT RATING</h3>

                <label className="rating-row">
                  <input
                    type="checkbox"
                    checked={rating === "4.5"}
                    onChange={() => setRating(rating === "4.5" ? "" : "4.5")}
                  />
                  <span>★★★★★</span>
                  <strong>4.5 & up</strong>
                </label>

                <label className="rating-row">
                  <input
                    type="checkbox"
                    checked={rating === "4.0"}
                    onChange={() => setRating(rating === "4.0" ? "" : "4.0")}
                  />
                  <span>★★★★☆</span>
                  <strong>4.0 & up</strong>
                </label>
              </div>

              <div className="filter-group">
                <h3>HOURLY RATE</h3>
                <div className="rate-line"></div>
                <div className="rate-labels">
                  <span>$20</span>
                  <strong>Up to $150/hr</strong>
                  <span>$500+</span>
                </div>
              </div>

              <div className="filter-group">
                <h3>AVAILABILITY</h3>

                {[
                  ["available", "Available Now"],
                  ["part-time", "Part-time (20h/w)"],
                  ["full-time", "Full-time (40h/w)"],
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
                  {filteredExperts.length.toLocaleString()} experts found matching
                  your criteria
                </strong>

                <div className="sort-box">
                  <span>Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Rating</option>
                    <option value="rate-low">Rate: Low to High</option>
                    <option value="rate-high">Rate: High to Low</option>
                  </select>
                  <ChevronDown size={18} />
                </div>
              </div>

              {loading ? (
                <div className="no-expert-result">Loading experts...</div>
              ) : error ? (
                <div className="no-expert-result">{error}</div>
              ) : filteredExperts.length === 0 ? (
                <div className="no-expert-result">
                  No experts found. Try changing your filters.
                </div>
              ) : (
                <div className="expert-grid">
                  {filteredExperts.map((expert) => (
                    <article className="expert-card" key={expert.id}>
                      <div className="expert-card-top">
                        <div className="expert-avatar-wrap">
                          <img src={expert.avatar} alt={expert.name} />
                          {expert.available && <span className="online-dot"></span>}
                        </div>

                        <div className="expert-rating">
                          <div>
                            <Star size={18} fill="currentColor" />
                            <strong>{expert.rating}</strong>
                            <span>({expert.reviews})</span>
                          </div>
                          <strong>${expert.rate}/hr</strong>
                        </div>
                      </div>

                      <h2>{expert.name}</h2>
                      <h4>{expert.title}</h4>

                      <div className="expert-tags">
                        {expert.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <p>{expert.description}</p>

                      <div className="expert-stats">
                        <span>
                          <CheckCircle2 size={18} />
                          {expert.projects} Projects
                        </span>

                        <span>
                          <Clock3 size={18} />
                          {expert.success}% Job Success
                        </span>
                      </div>

                      <div className="expert-actions">
                        <button
                          type="button"
                          onClick={() => navigate(`/client/experts/${expert.id}`)}
                        >
                          View Profile
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
                <button type="button" onClick={() => setPage(Math.max(1, page - 1))}>
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
