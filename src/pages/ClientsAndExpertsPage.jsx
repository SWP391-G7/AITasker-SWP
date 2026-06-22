import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "../Services/searchService";
import { isLoggedIn } from "../Services/checkLogin";
import { Search, SlidersHorizontal, User, Briefcase, Star, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import "./ClientsAndExpertsPage.css";

const MOCK_EXPERTS = [
  {
    id: "mock-exp-1",
    full_name: "Dr. Sarah Chen",
    professional_title: "Senior ML Research Scientist",
    skills: "PyTorch, LLM Fine-tuning, NLP, Deep Learning",
    bio: "Former AI lead at Google. Specializes in training custom large language models and prompt engineering.",
    hourly_rate: "$120/hr",
    avg_rating: 4.9,
    experience: "8+ years"
  },
  {
    id: "mock-exp-2",
    full_name: "Marcus Johnson",
    professional_title: "NLP Specialist",
    skills: "Transformers, BERT, GPT-4, Sentiment Analysis",
    bio: "Focuses on text extraction, semantic search, and customer service AI agent integrations.",
    hourly_rate: "$95/hr",
    avg_rating: 5.0,
    experience: "5 years"
  },
  {
    id: "mock-exp-3",
    full_name: "Elena Rodriguez",
    professional_title: "AI Automation Architect",
    skills: "LangChain, RPA, Python, API Integrations",
    bio: "Architect of complex multi-agent workflows, connecting internal corporate tools to LLM interfaces.",
    hourly_rate: "$85/hr",
    avg_rating: 4.8,
    experience: "4 years"
  },
  {
    id: "mock-exp-4",
    full_name: "David Kim",
    professional_title: "Computer Vision Engineer",
    skills: "OpenCV, YOLO, Image Segmentation, TensorFlow",
    bio: "Expert in real-time object detection, defect inspection systems, and automated retail solutions.",
    hourly_rate: "$110/hr",
    avg_rating: 4.9,
    experience: "6 years"
  },
  {
    id: "mock-exp-5",
    full_name: "Dr. Aris Thorne",
    professional_title: "Generative AI Specialist",
    skills: "Stable Diffusion, GANs, Image Generation, PyTorch",
    bio: "Designing bespoke generative creative pipelines for enterprise marketing and digital asset creation.",
    hourly_rate: "$130/hr",
    avg_rating: 5.0,
    experience: "7 years"
  },
  {
    id: "mock-exp-6",
    full_name: "Sophia Patel",
    professional_title: "MLOps & Cloud Architect",
    skills: "Kubernetes, Docker, AWS, MLflow, CI/CD",
    bio: "Bridging the gap between model development and production scale. Specializes in cost-optimized hosting.",
    hourly_rate: "$105/hr",
    avg_rating: 4.7,
    experience: "5 years"
  }
];

const MOCK_CLIENTS = [
  {
    id: "mock-cli-1",
    company_name: "Alpha AI Group",
    full_name: "Richard Vance",
    industry: "Finance & Banking",
    bio: "Leading quantitative finance firm deploying custom prediction engines for market analysis.",
    avg_rating: 4.9
  },
  {
    id: "mock-cli-2",
    company_name: "NextGen Automation",
    full_name: "Dr. Linus Sterling",
    industry: "Manufacturing & Logistics",
    bio: "Automated warehouse solutions provider integrating computer vision models into robotic arms.",
    avg_rating: 4.8
  },
  {
    id: "mock-cli-3",
    company_name: "DeepHealth Systems",
    full_name: "Dr. Evelyn Vance",
    industry: "Healthcare & Biotech",
    bio: "Developing state-of-the-art diagnostic assistant tools for clinical research laboratories.",
    avg_rating: 5.0
  },
  {
    id: "mock-cli-4",
    company_name: "EduTech AI",
    full_name: "Clara Oswald",
    industry: "Education & E-Learning",
    bio: "EdTech platform scaling personalized tutoring agents powered by fine-tuned open-source LLMs.",
    avg_rating: 4.6
  }
];

export default function ClientsAndExpertsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expert"); // "expert" or "client"
  const [experts, setExperts] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [rateMax, setRateMax] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Fetch experts and clients from the API in parallel
        const [expertRes, clientRes] = await Promise.allSettled([
          search({ target: "expert" }),
          search({ target: "client" })
        ]);

        let fetchedExperts = [];
        let fetchedClients = [];

        if (expertRes.status === "fulfilled" && expertRes.value.results?.length > 0) {
          fetchedExperts = expertRes.value.results;
        }
        
        if (clientRes.status === "fulfilled" && clientRes.value.results?.length > 0) {
          fetchedClients = clientRes.value.results;
        }

        // Merge API data with mock data (to ensure a rich UI experience)
        // Check for duplicates by full_name or company_name
        const mergedExperts = [...fetchedExperts];
        MOCK_EXPERTS.forEach(mock => {
          if (!mergedExperts.some(e => e.full_name?.toLowerCase() === mock.full_name.toLowerCase())) {
            mergedExperts.push(mock);
          }
        });

        const mergedClients = [...fetchedClients];
        MOCK_CLIENTS.forEach(mock => {
          if (!mergedClients.some(c => c.company_name?.toLowerCase() === mock.company_name.toLowerCase())) {
            mergedClients.push(mock);
          }
        });

        setExperts(mergedExperts);
        setClients(mergedClients);
      } catch (err) {
        console.error("Failed to load clients and experts:", err);
        // Fall back entirely to mock data if all API calls fail
        setExperts(MOCK_EXPERTS);
        setClients(MOCK_CLIENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleActionClick = () => {
    if (!isLoggedIn()) {
      navigate("/login", {
        state: { message: "Please log in or create an account to connect with users." }
      });
    } else {
      alert("Direct connection and messaging features are coming soon!");
    }
  };

  // Filtering Logic
  const getFilteredExperts = () => {
    return experts.filter(exp => {
      const matchesQuery = 
        exp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.professional_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.bio?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesSkill = selectedSkill 
        ? exp.skills?.toLowerCase().includes(selectedSkill.toLowerCase())
        : true;
        
      const matchesRate = rateMax
        ? parseFloat(exp.hourly_rate?.replace(/[^0-9.]/g, "")) <= parseFloat(rateMax)
        : true;

      return matchesQuery && matchesSkill && matchesRate;
    });
  };

  const getFilteredClients = () => {
    return clients.filter(cli => {
      const matchesQuery = 
        cli.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cli.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cli.bio?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesIndustry = selectedIndustry
        ? cli.industry?.toLowerCase().includes(selectedIndustry.toLowerCase())
        : true;

      return matchesQuery && matchesIndustry;
    });
  };

  const filteredExperts = getFilteredExperts();
  const filteredClients = getFilteredClients();

  // Extract unique skills/industries for filter options
  const allSkills = Array.from(
    new Set(
      experts
        .flatMap(e => e.skills?.split(",") || [])
        .map(s => s.trim())
        .filter(s => s.length > 0)
    )
  ).sort();

  const allIndustries = Array.from(
    new Set(
      clients
        .map(c => c.industry)
        .filter(i => i && i.length > 0)
    )
  ).sort();

  return (
    <div className="directory-page-wrapper">
      {/* Hero Section */}
      <section className="directory-hero">
        <div className="container text-center">
          <div className="badge-glow mb-3">
            <ShieldCheck size={14} className="text-primary me-1" />
            <span>Vetted B2B AI Network</span>
          </div>
          <h1 className="directory-hero-title mb-3">
            Connect with the <br />
            <span className="gradient-text">Top Minds in AI</span>
          </h1>
          <p className="directory-hero-desc mx-auto text-muted mb-4">
            Discover and collaborate with specialized machine learning researchers, engineers, and companies looking to deploy cutting-edge artificial intelligence.
          </p>

          {/* Directory Tabs */}
          <div className="directory-tabs d-flex justify-content-center gap-3">
            <button
              className={`directory-tab-btn d-flex align-items-center gap-2 ${activeTab === "expert" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("expert");
                setSearchQuery("");
                setShowFilters(false);
              }}
            >
              <User size={18} />
              <span>AI Experts</span>
            </button>
            <button
              className={`directory-tab-btn d-flex align-items-center gap-2 ${activeTab === "client" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("client");
                setSearchQuery("");
                setShowFilters(false);
              }}
            >
              <Building2 size={18} />
              <span>Top Clients</span>
            </button>
          </div>
        </div>
      </section>

      {/* Directory Search & Filters */}
      <section className="directory-controls-section">
        <div className="container">
          <div className="controls-card glass-card">
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder={activeTab === "expert" ? "Search expert name, title or bio..." : "Search company name, contact or bio..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="filters-expansion-panel mt-3">
                {activeTab === "expert" ? (
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="filter-label">Filter by Skill</label>
                      <select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className="form-select filter-select"
                      >
                        <option value="">All Skills</option>
                        {allSkills.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="filter-label">Max Hourly Rate ($/hr)</label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={rateMax}
                        onChange={(e) => setRateMax(e.target.value)}
                        className="form-control filter-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12">
                      <label className="filter-label">Filter by Industry</label>
                      <select
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="form-select filter-select"
                      >
                        <option value="">All Industries</option>
                        {allIndustries.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="directory-grid-section pb-5">
        <div className="container">
          {isLoading ? (
            <div className="directory-loading-state">
              <div className="spinner"></div>
              <p className="text-muted mt-3">Connecting to the B2B AI network...</p>
            </div>
          ) : activeTab === "expert" ? (
            /* EXPERTS LIST */
            filteredExperts.length === 0 ? (
              <div className="empty-state text-center py-5">
                <h3>No Experts Found</h3>
                <p className="text-muted">Try clearing your filters or refinement search.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredExperts.map(exp => (
                  <div key={exp.id} className="col-12 col-md-6 col-lg-4">
                    <div className="directory-card expert-card h-100 d-flex flex-column">
                      <div className="card-header-bar d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="expert-avatar-bubble">
                            {exp.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="card-title mb-0">{exp.full_name}</h3>
                            <p className="card-subtitle text-primary mb-0">{exp.professional_title || "AI Specialist"}</p>
                          </div>
                        </div>
                        <div className="rating-pill d-flex align-items-center gap-1">
                          <Star size={12} className="fill-warning text-warning" />
                          <span>{exp.avg_rating ? exp.avg_rating.toFixed(1) : "5.0"}</span>
                        </div>
                      </div>

                      <p className="card-bio text-muted mb-4">{exp.bio}</p>

                      {exp.skills && (
                        <div className="skills-row d-flex flex-wrap gap-2 mb-4 mt-auto">
                          {exp.skills.split(",").map((skill, index) => (
                            <span key={index} className="skill-pill">{skill.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div className="card-footer-metrics mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <span className="footer-label">HOURLY RATE</span>
                          <span className="rate-val fw-bold text-success">{exp.hourly_rate || "Flexible"}</span>
                        </div>
                        <button className="btn btn-connect glow-hover d-flex align-items-center gap-1" onClick={handleActionClick}>
                          <span>Hire Me</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* CLIENTS LIST */
            filteredClients.length === 0 ? (
              <div className="empty-state text-center py-5">
                <h3>No Clients Found</h3>
                <p className="text-muted">Try clearing your filters or refinement search.</p>
              </div>
            ) : (
              <div className="row g-4">
                {filteredClients.map(cli => (
                  <div key={cli.id} className="col-12 col-md-6 col-lg-4">
                    <div className="directory-card client-card h-100 d-flex flex-column">
                      <div className="card-header-bar d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="client-logo-bubble">
                            {cli.company_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="card-title mb-0">{cli.company_name}</h3>
                            <p className="card-subtitle text-muted mb-0">Rep: {cli.full_name}</p>
                          </div>
                        </div>
                        <div className="rating-pill d-flex align-items-center gap-1">
                          <Star size={12} className="fill-warning text-warning" />
                          <span>{cli.avg_rating ? cli.avg_rating.toFixed(1) : "5.0"}</span>
                        </div>
                      </div>

                      <p className="card-bio text-muted mb-4">{cli.bio}</p>

                      <div className="industry-row mb-4 mt-auto">
                        <span className="industry-pill">{cli.industry || "General Industry"}</span>
                      </div>

                      <div className="card-footer-metrics mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <span className="footer-label">PARTNERSHIP</span>
                          <span className="rate-val fw-bold text-info">Verified Client</span>
                        </div>
                        <button className="btn btn-connect client-btn d-flex align-items-center gap-1" onClick={handleActionClick}>
                          <span>Contact</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
